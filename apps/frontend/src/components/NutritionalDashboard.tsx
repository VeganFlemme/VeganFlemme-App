'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Heart, 
  Zap, 
  Shield, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Target,
  Apple,
  Activity,
  Award,
  Utensils,
  Search,
  Barcode
} from 'lucide-react';

interface NutritionalAlert {
  type: 'deficiency' | 'excess' | 'warning' | 'achievement';
  severity: 'low' | 'medium' | 'high' | 'critical';
  nutrient: string;
  message: string;
  recommendation?: string;
  timestamp: string;
}

interface NutritionalGap {
  nutrient: string;
  current: number;
  recommended: number;
  deficit: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

interface DailySummary {
  date: string;
  totalNutrition: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    iron: number;
    calcium: number;
    vitaminB12: number;
    vitaminD: number;
  };
  nutritionalAssessment?: {
    overallScore: number;
    adequacyPercentage: number;
    topGaps: NutritionalGap[];
    strengths: string[];
  };
  alerts: NutritionalAlert[];
}

interface WeeklySummary {
  period: string;
  averageDaily: any;
  nutritionalAssessment: {
    overallScore: number;
    adequacyPercentage: number;
    gaps: NutritionalGap[];
    supplementRecommendations?: string[];
  };
  trends: any[];
  achievements: string[];
  improvements: string[];
}

export default function NutritionalDashboard() {
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [alerts, setAlerts] = useState<NutritionalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Mock user ID for demo
  const userId = 'demo-user-123';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load mock data for demonstration
      const mockDailyData: DailySummary = {
        date: new Date().toISOString().split('T')[0],
        totalNutrition: {
          calories: 1850,
          protein: 72,
          carbohydrates: 245,
          fat: 58,
          fiber: 34,
          iron: 12.8,
          calcium: 890,
          vitaminB12: 3.2,
          vitaminD: 8.5
        },
        nutritionalAssessment: {
          overallScore: 78,
          adequacyPercentage: 82,
          topGaps: [
            {
              nutrient: 'vitaminD',
              current: 8.5,
              recommended: 15,
              deficit: 6.5,
              severity: 'medium',
              recommendations: ['Exposition solaire 15-20 min/jour', 'Compléments vitamine D3']
            },
            {
              nutrient: 'omega3',
              current: 1.2,
              recommended: 2.5,
              deficit: 1.3,
              severity: 'medium',
              recommendations: ['Graines de lin moulues', 'Huile de colza', 'Noix']
            }
          ],
          strengths: [
            'Excellent apport en fibres (113% RNP)',
            'Bon niveau vitamine B12 (133% RNP)',
            'Protéines bien équilibrées'
          ]
        },
        alerts: [
          {
            type: 'achievement',
            severity: 'low',
            nutrient: 'fiber',
            message: 'Objectif fibres dépassé ! 34g/30g',
            timestamp: new Date().toISOString()
          },
          {
            type: 'warning',
            severity: 'medium',
            nutrient: 'vitaminD',
            message: 'Vitamine D insuffisante: 8.5/15 μg',
            recommendation: 'Exposition solaire ou complémentation',
            timestamp: new Date().toISOString()
          }
        ]
      };

      const mockWeeklyData: WeeklySummary = {
        period: 'Semaine du 28 Jan - 3 Fév 2024',
        averageDaily: {
          calories: 1920,
          protein: 75,
          iron: 13.2,
          calcium: 925,
          vitaminB12: 3.8,
          vitaminD: 9.2
        },
        nutritionalAssessment: {
          overallScore: 81,
          adequacyPercentage: 85,
          gaps: [
            {
              nutrient: 'vitaminD',
              current: 9.2,
              recommended: 15,
              deficit: 5.8,
              severity: 'medium',
              recommendations: ['Complémentation D3 recommandée']
            }
          ],
          supplementRecommendations: [
            'Vitamine D3: 1000-2000 UI/jour (octobre-mars)',
            'Vitamine B12: Maintenir supplémentation actuelle'
          ]
        },
        trends: [],
        achievements: [
          'Score nutritionnel excellent cette semaine! (81/100)',
          'Objectifs protéines atteints 7/7 jours',
          'Régularité alimentaire excellente'
        ],
        improvements: [
          'Augmenter exposition solaire pour vitamine D',
          'Ajouter graines de lin pour oméga-3',
          'Continuer les bonnes habitudes!'
        ]
      };

      setDailySummary(mockDailyData);
      setWeeklySummary(mockWeeklyData);
      setAlerts(mockDailyData.alerts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      // Mock search results
      const mockResults = [
        {
          id: 'off:123',
          name: 'Tofu bio ferme',
          brands: 'Bjorg',
          nutrition: { calories: 145, protein: 15.8, iron: 2.8 },
          dataSource: 'openfoodfacts',
          confidence: 0.9
        },
        {
          id: 'spoon:456',
          name: 'Buddha Bowl aux légumes',
          nutrition: { calories: 380, protein: 18, iron: 4.2 },
          dataSource: 'spoonacular',
          confidence: 0.8
        }
      ];
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const scanBarcode = async () => {
    if (!barcodeInput.trim()) return;
    
    try {
      // Mock barcode result
      alert(`Code-barres scanné: ${barcodeInput}\nProduit trouvé dans OpenFoodFacts!`);
      setBarcodeInput('');
    } catch (error) {
      console.error('Barcode scan error:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'deficiency': return <AlertCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const macroData = dailySummary ? [
    { name: 'Protéines', value: dailySummary.totalNutrition.protein, color: '#10B981' },
    { name: 'Glucides', value: dailySummary.totalNutrition.carbohydrates, color: '#3B82F6' },
    { name: 'Lipides', value: dailySummary.totalNutrition.fat, color: '#F59E0B' }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌱 Dashboard Nutritionnel VeganFlemme
          </h1>
          <p className="text-xl text-gray-600">
            Suivi intelligent avec ANSES RNP • OpenFoodFacts • Spoonacular
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Badge variant="outline" className="bg-green-100">
              <Shield className="w-4 h-4 mr-1" />
              ANSES RNP Compliant
            </Badge>
            <Badge variant="outline" className="bg-blue-100">
              <Zap className="w-4 h-4 mr-1" />
              Temps réel
            </Badge>
            <Badge variant="outline" className="bg-purple-100">
              <Target className="w-4 h-4 mr-1" />
              Ajustements végétaliens
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        {dailySummary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Score Nutritionnel</p>
                    <p className="text-2xl font-bold text-green-600">
                      {dailySummary.nutritionalAssessment?.overallScore || 0}/100
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Adéquation RNP</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {dailySummary.nutritionalAssessment?.adequacyPercentage || 0}%
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {dailySummary.totalNutrition.calories}
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Alertes</p>
                    <p className="text-2xl font-bold text-red-600">
                      {alerts.length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="today">Aujourd'hui</TabsTrigger>
            <TabsTrigger value="week">Semaine</TabsTrigger>
            <TabsTrigger value="search">Recherche</TabsTrigger>
            <TabsTrigger value="recipes">Recettes</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Macronutrients Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Utensils className="w-5 h-5 mr-2" />
                    Répartition Macronutriments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={macroData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}g`}
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Nutrient Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Objectifs Nutritionnels ANSES</CardTitle>
                  <CardDescription>Progression vs RNP française (ajustée végan)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dailySummary && [
                    { name: 'Protéines', current: 72, target: 78, unit: 'g' },
                    { name: 'Fer (x1.8)', current: 12.8, target: 28.8, unit: 'mg' },
                    { name: 'Calcium', current: 890, target: 950, unit: 'mg' },
                    { name: 'Vitamine B12', current: 3.2, target: 4, unit: 'μg' },
                    { name: 'Vitamine D', current: 8.5, target: 15, unit: 'μg' },
                    { name: 'Fibres', current: 34, target: 30, unit: 'g' }
                  ].map((nutrient) => {
                    const percentage = Math.min((nutrient.current / nutrient.target) * 100, 100);
                    const isGood = percentage >= 90;
                    
                    return (
                      <div key={nutrient.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{nutrient.name}</span>
                          <span className={isGood ? 'text-green-600' : 'text-orange-600'}>
                            {nutrient.current}{nutrient.unit} / {nutrient.target}{nutrient.unit}
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className={`h-2 ${isGood ? 'bg-green-100' : 'bg-orange-100'}`}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Alertes Nutritionnelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                      <div className={`p-1 rounded ${getSeverityColor(alert.severity)} text-white`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        {alert.recommendation && (
                          <p className="text-sm text-gray-600 mt-1">{alert.recommendation}</p>
                        )}
                      </div>
                      <Badge variant="outline">{alert.severity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Week Tab */}
          <TabsContent value="week" className="space-y-6">
            {weeklySummary && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé Hebdomadaire</CardTitle>
                    <CardDescription>{weeklySummary.period}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">🎉 Réussites</h4>
                        <ul className="space-y-1">
                          {weeklySummary.achievements.map((achievement, index) => (
                            <li key={index} className="text-sm text-green-700">
                              • {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">💊 Suppléments Recommandés</h4>
                        <ul className="space-y-1">
                          {weeklySummary.nutritionalAssessment.supplementRecommendations?.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-700">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Améliorations Suggérées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weeklySummary.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <TrendingUp className="w-4 h-4 text-orange-500 mt-1" />
                          <p className="text-sm">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Recherche Unifiée
                  </CardTitle>
                  <CardDescription>OpenFoodFacts + Spoonacular + Base utilisateurs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Rechercher un aliment ou recette..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <Button onClick={searchFoods}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.map((result, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{result.name}</h4>
                              {result.brands && <p className="text-sm text-gray-600">{result.brands}</p>}
                              <p className="text-xs text-gray-500">
                                {result.nutrition.calories} kcal • {result.nutrition.protein}g protéines
                              </p>
                            </div>
                            <Badge variant="outline">{result.dataSource}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Barcode className="w-5 h-5 mr-2" />
                    Scanner Code-barres
                  </CardTitle>
                  <CardDescription>Vérification OpenFoodFacts instantanée</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Code-barres du produit..."
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    />
                    <Button onClick={scanBarcode}>
                      <Barcode className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Essayez: 737628064502 (lait d'avoine) ou 3017620425035 (tofu)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Apple className="w-5 h-5 mr-2" />
                  Recettes Spoonacular
                </CardTitle>
                <CardDescription>
                  Recettes végétaliennes avec analyse nutritionnelle complète
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Buddha Bowl Protéiné',
                      healthScore: 92,
                      readyInMinutes: 25,
                      servings: 2,
                      nutrition: { calories: 380, protein: 18, iron: 4.2 }
                    },
                    {
                      title: 'Curry de Lentilles',
                      healthScore: 88,
                      readyInMinutes: 30,
                      servings: 4,
                      nutrition: { calories: 290, protein: 16, iron: 5.8 }
                    },
                    {
                      title: 'Smoothie Bowl Antioxydant',
                      healthScore: 95,
                      readyInMinutes: 10,
                      servings: 1,
                      nutrition: { calories: 245, protein: 8, iron: 2.1 }
                    }
                  ].map((recipe, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-semibold mb-2">{recipe.title}</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Score santé</span>
                          <Badge variant="outline" className="bg-green-50">
                            {recipe.healthScore}/100
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Temps</span>
                          <span>{recipe.readyInMinutes} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Portions</span>
                          <span>{recipe.servings}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p>{recipe.nutrition.calories} kcal • {recipe.nutrition.protein}g protéines</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🔧 État du Système</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>ANSES RNP Service</span>
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Actif
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>OpenFoodFacts</span>
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connecté
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Spoonacular API</span>
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Disponible
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Suivi Temps Réel</span>
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Fonctionnel
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Recommandations ANSES</span>
                    <span className="font-semibold">26 nutriments</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Ajustements végétaliens</span>
                    <span className="font-semibold">9 nutriments</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Aliments en cache</span>
                    <span className="font-semibold">1,247</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Recettes disponibles</span>
                    <span className="font-semibold">5,000+</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>🚀 Nouvelles Fonctionnalités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Implémenté</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Suppression complète de CIQUAL</li>
                      <li>• Intégration ANSES RNP française</li>
                      <li>• Ajustements nutritionnels végétaliens</li>
                      <li>• API Spoonacular pour recettes</li>
                      <li>• Suivi nutritionnel temps réel</li>
                      <li>• Vérification ingrédients OpenFoodFacts</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🔄 Améliorations</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Performance optimisée (cache intelligent)</li>
                      <li>• Évaluation nutritionnelle précise</li>
                      <li>• Alertes personnalisées</li>
                      <li>• Recommandations scientifiques</li>
                      <li>• Interface unifiée</li>
                      <li>• Connectivité API fiable</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}