import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";
import {
    Search, Clock, GraduationCap, Star, ArrowUpRight,
    BookOpen, Award, Monitor, Users
} from "lucide-react";

const categories: Record<string, Record<string, string>> = {
    "all": { en: "All Categories", hi: "सभी श्रेणियां", mr: "सर्व श्रेणी" },
    "Beauty / Wellness": { en: "Beauty / Wellness", hi: "सौंदर्य / वेलनेस", mr: "सौंदर्य / वेलनेस" },
    "Digital / Computer": { en: "Digital / Computer", hi: "डिजिटल / कंप्यूटर", mr: "डिजिटल / कॉम्प्युटर" },
    "Tailoring / Handicrafts": { en: "Tailoring / Handicrafts", hi: "सिलाई / हस्तशिल्प", mr: "शिवणकाम / हस्तकला" },
    "Agriculture": { en: "Agriculture", hi: "कृषि", mr: "शेती" },
    "Business / Finance": { en: "Business / Finance", hi: "व्यवसाय / वित्त", mr: "व्यवसाय / वित्त" },
    "Electronics / Technical": { en: "Electronics / Technical", hi: "इलेक्ट्रॉनिक्स / तकनीकी", mr: "इलेक्ट्रॉनिक्स / तांत्रिक" },
    "Digital / Marketing": { en: "Digital Marketing", hi: "डिजिटल मार्केटिंग", mr: "डिजिटल मार्केटिंग" },
    "Language / Communication": { en: "Language / Communication", hi: "भाषा / संवाद", mr: "भाषा / संवाद" },
    "Food Processing": { en: "Food Processing", hi: "खाद्य प्रसंस्करण", mr: "अन्न प्रक्रिया" },
    "Health / Caregiving": { en: "Health / Caregiving", hi: "स्वास्थ्य / देखभाल", mr: "आरोग्य / संगोपन" },
};

const modes: Record<string, Record<string, string>> = {
    "all": { en: "All Modes", hi: "सभी मोड", mr: "सर्व प्रकार" },
    "Online": { en: "Online", hi: "ऑनलाइन", mr: "ऑनलाइन" },
    "In-Person": { en: "In-Person", hi: "व्यक्तिगत", mr: "प्रत्यक्ष" },
};

export default function Training() {
    const { language, t } = useLanguage();
    const lang = language as "en" | "hi" | "mr";
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [mode, setMode] = useState("all");
    const [freeOnly, setFreeOnly] = useState(false);

    const { data: apiCourses } = useQuery<any[]>({ queryKey: ["/api/training"] });

    const courseList = apiCourses || [];

    const filteredCourses = courseList.filter((course: any) => {
        const matchSearch = !search ||
            course.title?.toLowerCase().includes(search.toLowerCase()) ||
            course.provider?.toLowerCase().includes(search.toLowerCase()) ||
            (course.skills || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
        const matchCategory = category === "all" || course.category === category;
        const matchMode = mode === "all" || course.mode === mode;
        const matchFree = !freeOnly || course.isFree;
        return matchSearch && matchCategory && matchMode && matchFree;
    });

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>
                        {t("training.title")}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t("training.subtitle")}
                    </p>
                </div>

                {/* Filters */}
                <Card className="mb-8">
                    <CardContent className="p-4">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder={t("training.search")}
                                    className="pl-10"
                                    data-testid="input-search-training"
                                />
                            </div>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger data-testid="select-category">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categories).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v[lang] || v.en}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={mode} onValueChange={setMode}>
                                <SelectTrigger data-testid="select-mode">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(modes).map(([k, v]) => (
                                        <SelectItem key={k} value={k}>{v[lang] || v.en}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-2">
                                <Switch id="free" checked={freeOnly} onCheckedChange={setFreeOnly} data-testid="switch-free" />
                                <Label htmlFor="free" className="text-sm">{t("training.freeOnly")}</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Courses Grid */}
                {filteredCourses.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-lg text-muted-foreground">{t("training.noCourses")}</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredCourses.map((course: any) => (
                            <Card key={course.id} className="hover-elevate transition-all duration-200">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <CardTitle className="text-lg leading-snug">{course.title}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>{course.provider}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {course.isFree && (
                                                <Badge className="bg-green-600 text-white whitespace-nowrap">
                                                    ✅ FREE
                                                </Badge>
                                            )}
                                            <Badge variant="secondary" className="whitespace-nowrap">
                                                {course.mode === "Online" ? <Monitor className="h-3 w-3 mr-1" /> : <Users className="h-3 w-3 mr-1" />}
                                                {modes[course.mode]?.[lang] || course.mode}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>

                                    <div className="flex flex-wrap gap-3 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{course.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                                            <span>{course.rating}/5</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            <span>{course.language}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-primary/5 border">
                                        <Award className="h-4 w-4 text-primary" />
                                        <span className="text-xs font-medium">
                                            {t("training.certificate")}: {course.certifiedBy}
                                        </span>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {(course.skills || []).slice(0, 4).map((skill: string) => (
                                            <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                                        ))}
                                        {(course.skills || []).length > 4 && (
                                            <Badge variant="outline" className="text-xs">+{course.skills.length - 4}</Badge>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <a href={course.enrollUrl} target="_blank" rel="noopener noreferrer">
                                            <Button size="sm" className="gap-1.5" data-testid={`button-enroll-${course.id}`}>
                                                {t("training.enrollNow")}
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
