
import React, { useState, useMemo, useEffect } from 'react';
import { LegalTextsFilter } from './LegalTextsFilter';
import { LegalTextsInstitutions } from './LegalTextsInstitutions';
import { LegalTextsTypes } from './LegalTextsTypes';
import { LegalTextsFeatured } from './LegalTextsFeatured';
import { LegalTextsTestimonials } from './LegalTextsTestimonials';
import { LegalTextsContribute } from './LegalTextsContribute';
import { LegalTextsStatistics } from './LegalTextsStatistics';
import { LegalTextsSearchActions } from './LegalTextsSearchActions';
import { LegalTextCard } from './LegalTextCard';
import { LegalTextsEmptyState } from './LegalTextsEmptyState';
import { useLegalTextsData } from './hooks/useLegalTextsData';
import { TabSearchField } from '@/components/common/TabSearchField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterOptions, SortOption, FilterService, LegalText } from '@/services/filterService';

interface LegalTextsCatalogTabProps {
  onAddLegalText?: () => void;
  onOpenApprovalQueue?: () => void;
}

export function LegalTextsCatalogTab({ onAddLegalText, onOpenApprovalQueue }: LegalTextsCatalogTabProps) {
  const {
    filteredTexts,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters
  } = useLegalTextsData();

  const [currentFilters, setCurrentFilters] = useState<FilterOptions>({});
  const [currentSort, setCurrentSort] = useState<SortOption>({ field: 'date', direction: 'desc' });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(processedTexts.length / pageSize));
  const paginatedTexts = processedTexts.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages || page < 1 || isNaN(page)) {
      setPage(1);
    }
  }, [processedTexts, page, totalPages]);

  // Convertir les données en format LegalText pour le service de filtrage
  const convertedTexts: LegalText[] = useMemo(() => {
    return filteredTexts.map(text => ({
      id: text.id,
      title: text.title,
      type: text.type || 'Loi',
      status: text.status || 'En vigueur',
      date: new Date(text.date || Date.now()),
      source: text.source || 'Journal Officiel',
      author: text.author || 'République Algérienne',
      insertionMethod: text.insertionMethod || 'manual',
      popularity: text.views || 0,
      ...text
    }));
  }, [filteredTexts]);

  // Appliquer les filtres et le tri
  const processedTexts = useMemo(() => {
    let result = FilterService.applyLegalTextFilters(convertedTexts, currentFilters);
    result = FilterService.applySortOrder(result, currentSort);
    return result;
  }, [convertedTexts, currentFilters, currentSort]);

  const handleFilterChange = (newFilters: { type?: string; status?: string }) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
  };

  const handleFiltersApplied = (filters: FilterOptions) => {
    setCurrentFilters(filters);
    console.log('✅ Advanced filters applied:', filters);
  };

  const handleSortApplied = (sort: SortOption) => {
    setCurrentSort(sort);
    console.log('✅ Sort applied:', sort);
  };

  const handleOpenApprovalQueue = () => {
    console.log('Opening approval queue...');
    if (onOpenApprovalQueue) {
      onOpenApprovalQueue();
    }
  };

  const handleTabSearch = (query: string) => {
    setSearchTerm(query);
    console.log('Tab search:', query);
  };

  // Ajout d'un filtrage robuste avant le rendu :
  const safeSearchTerm = (searchTerm || '').toLowerCase();
  const safeProcessedTexts = processedTexts.filter(text =>
    (text.title?.toLowerCase() || '').includes(safeSearchTerm) ||
    (text.description?.toLowerCase() || '').includes(safeSearchTerm) ||
    (text.category?.toLowerCase() || '').includes(safeSearchTerm)
  );
  const paginatedTexts = safeProcessedTexts.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(safeProcessedTexts.length / pageSize));

  return (
    <div className="space-y-6">
      {/* Nouveau champ de recherche avec reconnaissance vocale */}
      <TabSearchField
        placeholder="Rechercher des textes juridiques..."
        onSearch={handleTabSearch}
        suggestions={[
          "Code civil algérien",
          "Loi sur l'investissement 2022",
          "Décret exécutif",
          "Ordonnance présidentielle",
          "Code de procédure civile",
          "Loi de finances",
          "Code pénal",
          "Code du travail"
        ]}
      />

      {/* Statistiques */}
      <LegalTextsStatistics filteredTexts={processedTexts} />

      {/* Barre de recherche et boutons d'action avec bouton File d'approbation fonctionnel */}
      <LegalTextsSearchActions
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddLegalText={onAddLegalText}
        onOpenApprovalQueue={handleOpenApprovalQueue}
        availableData={convertedTexts}
        onFiltersApplied={handleFiltersApplied}
        onSortApplied={handleSortApplied}
        currentFilters={currentFilters}
        currentSort={currentSort}
      />

      {/* Filtre avec onglets */}
      <LegalTextsFilter onFilterChange={handleFilterChange} />

      {/* Liste des textes juridiques filtrés */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedTexts.length === 0 ? (
            <div className="col-span-2 text-center text-gray-500 py-8">Aucun texte à afficher.</div>
          ) : (
            paginatedTexts.map((text) => (
              <LegalTextCard key={text.id} text={text} />
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`