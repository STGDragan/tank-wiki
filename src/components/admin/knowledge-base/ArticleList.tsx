
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Article = Tables<'knowledge_articles'> & { knowledge_categories: { name: string } | null };

const fetchArticles = async (): Promise<Article[]> => {
    const { data, error } = await supabase
        .from('knowledge_articles')
        .select(`
            *,
            knowledge_categories (
                name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as Article[];
};

export const ArticleList = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: articles, isLoading, error } = useQuery({ queryKey: ['knowledge_articles'], queryFn: fetchArticles });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('knowledge_articles').delete().eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge_articles'] });
            toast.success("Article deleted successfully.");
        },
        onError: (error) => {
            toast.error(`Failed to delete article: ${error.message}`);
        }
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }
    
    if (error) return <div>Error loading articles: {error.message}</div>;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Articles</CardTitle>
                    <Button asChild>
                        <Link to="/admin/knowledge-base/article/new">Add New Article</Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {articles?.map(article => (
                            <TableRow key={article.id}>
                                <TableCell className="font-medium">{article.title}</TableCell>
                                <TableCell>{article.knowledge_categories?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                                        {article.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(article.created_at), 'PPP')}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigate(`/admin/knowledge-base/article/edit/${article.id}`)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => deleteMutation.mutate(article.id)}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};
