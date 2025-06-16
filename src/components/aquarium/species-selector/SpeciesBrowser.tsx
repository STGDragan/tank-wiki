
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SpeciesInfoCard } from './SpeciesInfoCard';
import { detailedMarineFish, DetailedFishInfo } from '@/data/species/detailedFishData';
import { Search, Filter } from 'lucide-react';

export function SpeciesBrowser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [familyFilter, setFamilyFilter] = useState<string>('all');

  const filteredSpecies = detailedMarineFish.filter((fish) => {
    const matchesSearch = fish.species_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fish.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fish.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === 'all' || fish.difficulty === difficultyFilter;
    const matchesFamily = familyFilter === 'all' || fish.family_name === familyFilter;
    
    return matchesSearch && matchesDifficulty && matchesFamily;
  });

  const uniqueFamilies = Array.from(new Set(detailedMarineFish.map(fish => fish.family_name))).sort();
  const difficulties = ['Easy', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search species, family, or characteristics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={familyFilter} onValueChange={setFamilyFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Family" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Families</SelectItem>
              {uniqueFamilies.map(family => (
                <SelectItem key={family} value={family}>
                  {family}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="outline">
          {filteredSpecies.length} species found
        </Badge>
        {searchTerm && (
          <Badge variant="secondary">
            Search: "{searchTerm}"
          </Badge>
        )}
        {difficultyFilter !== 'all' && (
          <Badge variant="secondary">
            Difficulty: {difficultyFilter}
          </Badge>
        )}
        {familyFilter !== 'all' && (
          <Badge variant="secondary">
            Family: {familyFilter}
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {filteredSpecies.length > 0 ? (
          filteredSpecies.map((fish) => (
            <SpeciesInfoCard
              key={fish.unique_id}
              speciesName={fish.species_name.split('(')[0].trim()}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No species found matching your criteria. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}
