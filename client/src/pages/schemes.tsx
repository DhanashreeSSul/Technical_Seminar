import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  ExternalLink,
  Building2,
  Users,
  Filter
} from "lucide-react";
import type { GovernmentScheme } from "@shared/schema";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "education", label: "Education" },
  { value: "employment", label: "Employment" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "health", label: "Health" },
  { value: "financial", label: "Financial Support" },
  { value: "skill", label: "Skill Development" },
];

export default function Schemes() {
  const initialParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const [search, setSearch] = useState(initialParams.get("search") || "");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const { data: schemes, isLoading } = useQuery<GovernmentScheme[]>({
    queryKey: ["/api/schemes"],
  });

  const filteredSchemes = schemes?.filter(scheme => {
    const searchTerm = search.toLowerCase();
    const nameMatch = scheme.name?.toLowerCase().includes(searchTerm) || 
                      scheme.nameHindi?.includes(search);
    const descMatch = scheme.description?.toLowerCase().includes(searchTerm) ||
                      scheme.descriptionHindi?.includes(search);
    if (search && !nameMatch && !descMatch) return false;
    if (category !== "all" && scheme.category !== category) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
                {language === "en" ? "Government Schemes" : "सरकारी योजनाएं"}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {language === "en" 
                  ? "Discover government programs and schemes designed to support women's education, employment, and entrepreneurship."
                  : "महिलाओं की शिक्षा, रोजगार और उद्यमिता का समर्थन करने के लिए सरकारी कार्यक्रमों और योजनाओं की खोज करें।"
                }
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setLanguage(l => l === "en" ? "hi" : "en")}
              data-testid="button-toggle-scheme-language"
            >
              {language === "en" ? "हिंदी" : "English"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === "en" ? "Search schemes..." : "योजनाएं खोजें..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-schemes"
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]" data-testid="select-scheme-category">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSchemes?.length ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredSchemes.map(scheme => (
              <Card key={scheme.id} className="hover-elevate" data-testid={`card-scheme-${scheme.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">
                      {language === "en" ? scheme.name : (scheme.nameHindi || scheme.name)}
                    </CardTitle>
                    {scheme.category && (
                      <Badge variant="secondary" className="capitalize flex-shrink-0">
                        {scheme.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {language === "en" 
                      ? scheme.description 
                      : (scheme.descriptionHindi || scheme.description)
                    }
                  </p>

                  {scheme.ministry && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{scheme.ministry}</span>
                    </div>
                  )}

                  {scheme.targetGroup && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{scheme.targetGroup}</span>
                    </div>
                  )}

                  {scheme.eligibility && (
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {language === "en" ? "Eligibility" : "पात्रता"}
                      </p>
                      <p className="text-sm text-muted-foreground">{scheme.eligibility}</p>
                    </div>
                  )}

                  {scheme.benefits && (
                    <div>
                      <p className="text-sm font-medium mb-1">
                        {language === "en" ? "Benefits" : "लाभ"}
                      </p>
                      <p className="text-sm text-muted-foreground">{scheme.benefits}</p>
                    </div>
                  )}

                  {scheme.applicationLink && (
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={scheme.applicationLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        {language === "en" ? "Apply Now" : "अभी आवेदन करें"}
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === "en" ? "No schemes found" : "कोई योजना नहीं मिली"}
              </h3>
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "Try adjusting your search or filters."
                  : "अपनी खोज या फ़िल्टर समायोजित करने का प्रयास करें।"
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
