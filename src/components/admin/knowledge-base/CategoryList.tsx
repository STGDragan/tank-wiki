
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { CategoryDialog } from "./CategoryDialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type Category = Tables<'knowledge_categories'>;

const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
        .from('knowledge_categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

export const CategoryList = () => {
    const queryClient = useQueryClient();
    const { data: categories, isLoading, error } = useQuery({ queryKey: ['knowledge_categories'], queryFn: fetchCategories });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('knowledge_categories').delete().eq('id', id);
            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge_categories'] });
            toast.success("Category deleted successfully.");
        },
        onError: (error) => {
            toast.error(`Failed to delete category: ${error.message}`);
        }
    });
    
    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setIsDialogOpen(true);
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-48 w-full" />
            </div>
        );
    }

    if (error) return <div>Error loading categories: {error.message}</div>;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Categories</CardTitle>
                    <Button onClick={handleAdd}>Add New Category</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories?.map(category => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>{category.slug}</TableCell>
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
                                            <DropdownMenuItem onClick={() => handleEdit(category)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => deleteMutation.mutate(category.id)}
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
            <CategoryDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                category={selectedCategory}
            />
        </Card>
    );
};
