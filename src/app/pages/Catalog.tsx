import { useState } from 'react';
import { Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { Navbar } from '../components/Navbar';
import { SearchBar } from '../components/SearchBar';
import { CatalogSearchCard } from '../components/CatalogSearchCard';
import { Button } from '../components/ui/button';
import { catalogService, type CatalogSearchResult } from '../services/catalog.service';

export function Catalog() {
  const [searchResult, setSearchResult] = useState<CatalogSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [error, setError] = useState('');

  const runSearch = async (query: string, page: number = 1) => {
    setLoading(true);
    setError('');

    try {
      const result = await catalogService.search(query, page, 10);
      setSearchResult(result);
      setActiveQuery(query.trim());
    } catch (searchError) {
      console.error('Failed to search catalog:', searchError);
      setError(searchError instanceof Error ? searchError.message : 'Catalog search failed');
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    runSearch(query, 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveQuery('');
    setSearchResult(null);
    setError('');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">Movie Catalog</h1>
                <p className="mt-1 text-muted-foreground">
                  Search the indexed catalog through the backend Elastic endpoint
                </p>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-foreground">Can&apos;t find the release you need?</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Search existing releases here, or start the release creation flow from a TMDB film search.
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/catalog/releases/new">Add it</Link>
                  </Button>
                </div>
              </div>

              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                className="max-w-2xl"
                placeholder="Search titles in the catalog..."
              />

              <div className="flex flex-wrap items-center gap-3">
                {activeQuery ? (
                  <>
                    <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                      Query: {activeQuery}
                    </div>
                    {searchResult && (
                      <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                        {searchResult.totalElements.toLocaleString('en-US')} results
                      </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={clearSearch}>
                      Clear search
                    </Button>
                  </>
                ) : (
                  <div className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
                    Use the search bar to query `/api/catalog/elastic/search`
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Filter className="mb-4 h-16 w-16 text-destructive" />
              <h3 className="mb-2 text-xl font-semibold">Search failed</h3>
              <p className="mb-4 max-w-xl text-muted-foreground">{error}</p>
              <Button onClick={() => runSearch(activeQuery || searchQuery, searchResult?.page ?? 0)}>Retry search</Button>
            </div>
          ) : searchResult && searchResult.elements.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {searchResult.elements.map((item) => (
                  <CatalogSearchCard key={item.id} item={item} />
                ))}
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {searchResult.page + 1} of {Math.max(searchResult.totalPages, 1)} | {searchResult.totalElements.toLocaleString('en-US')} total results
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    disabled={!searchResult.hasPrevious || searchResult.prevPage === null}
                    onClick={() => runSearch(activeQuery, searchResult.prevPage ?? searchResult.page)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!searchResult.hasNext || searchResult.nextPage === null}
                    onClick={() => runSearch(activeQuery, searchResult.nextPage ?? searchResult.page)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : activeQuery ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Filter className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No results found</h3>
              <p className="mb-4 text-muted-foreground">
                No catalog entries matched "{activeQuery}"
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={clearSearch}>Clear search</Button>
                <Button asChild variant="outline">
                  <Link to="/catalog/releases/new">Add missing release</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Filter className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">Search the catalog</h3>
              <p className="mb-4 text-muted-foreground">
                Start with a title query and the page will call the backend Elastic search endpoint.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={() => handleSearch(searchQuery)} disabled={!searchQuery.trim()}>
                  Search now
                </Button>
                <Button asChild variant="outline">
                  <Link to="/catalog/releases/new">Add a release</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Catalog;
