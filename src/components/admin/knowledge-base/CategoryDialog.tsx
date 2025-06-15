import { useQueryClient } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useUpsertCategory } from "@/hooks/useKnowledgeBase";
import { categorySchema, CategoryFormData } from "@/lib/schemas/knowledgeBaseSchemas";

type Category = Tables<'knowledge_categories'>;

interface CategoryDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    category: Category | null;
}

export const CategoryDialog = ({ isOpen, setIsOpen, category }: CategoryDialogProps) => {
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: '',
            slug: '',
            description: ''
        }
    });

    useEffect(() => {
        if (category) {
            reset(category);
        } else {
            reset({ name: '', slug: '', description: '' });
        }
    }, [category, reset]);

    const mutation = useUpsertCategory(category);

    const onSubmit = (data: CategoryFormData) => {
        mutation.mutate(data, {
            onSuccess: () => {
                setIsOpen(false);
            }
        });
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setValue('name', name);
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        setValue('slug', slug);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
                    <DialogDescription>
                        {category ? "Update the details of this category." : "Create a new category for your articles."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" {...register("name")} onChange={handleNameChange} />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" {...register("slug")} />
                        {errors.slug && <p className="text-red-500 text-sm">{errors.slug.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" {...register("description")} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
