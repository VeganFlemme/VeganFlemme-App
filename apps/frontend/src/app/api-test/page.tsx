'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface APITestResult {
  endpoint: string;
  status: 'testing' | 'success' | 'error';
  response?: any;
  error?: string;
  duration?: number;
}

export default function APITesterPage() {
  const [results, setResults] = useState<APITestResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Backend API base URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const endpoints = [
    {
      name: 'ANSES RNP Data',
      endpoint: '/nutrition/rnp-anses',
      method: 'GET'
    },
    {
      name: 'Food Database Status',
      endpoint: '/nutrition/databases/status',
      method: 'GET'
    },
    {
      name: 'Unified Food Search',
      endpoint: '/nutrition/search?query=tofu&limit=5',
      method: 'GET'
    },
    {
      name: 'OpenFoodFacts Search',
      endpoint: '/nutrition/openfoodfacts/search?query=oat%20milk&pageSize=3',
      method: 'GET'
    },
    {
      name: 'Spoonacular Random Recipes',
      endpoint: '/nutrition/spoonacular/random?number=3',
      method: 'GET'
    },
    {
      name: 'Nutritional Assessment',
      endpoint: '/nutrition/assess',
      method: 'POST',
      body: {
        profile: {
          age: 30,
          gender: 'female',
          weight: 65,
          height: 165,
          activityLevel: 'moderate'
        },
        dailyIntake: {
          calories: 1800,
          protein: 60,
          iron: 12,
          calcium: 800,
          vitaminB12: 2.0,
          vitaminD: 10
        }
      }
    }
  ];

  const testEndpoint = async (endpoint: any): Promise<APITestResult> => {
    const startTime = Date.now();
    
    try {
      const url = `${API_BASE}${endpoint.endpoint}`;
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }

      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        endpoint: endpoint.name,
        status: 'success',
        response: data,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        endpoint: endpoint.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);

    for (const endpoint of endpoints) {
      setResults(prev => [...prev, {
        endpoint: endpoint.name,
        status: 'testing'
      }]);

      const result = await testEndpoint(endpoint);
      
      setResults(prev => 
        prev.map(r => r.endpoint === endpoint.name ? result : r)
      );

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'testing':
        return <Badge className="bg-yellow-500">En test...</Badge>;
      case 'success':
        return <Badge className="bg-green-500">✅ Succès</Badge>;
      case 'error':
        return <Badge className="bg-red-500">❌ Erreur</Badge>;
      default:
        return <Badge>Inconnu</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 Testeur API VeganFlemme
          </h1>
          <p className="text-xl text-gray-600">
            Vérification de la connectivité des nouvelles APIs
          </p>
          <div className="flex justify-center space-x-4 mt-4">
            <Badge variant="outline" className="bg-green-100">
              ANSES RNP • OpenFoodFacts • Spoonacular
            </Badge>
          </div>
        </div>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Contrôles de Test</CardTitle>
            <CardDescription>
              Testez la connectivité de toutes les nouvelles APIs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runAllTests} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Tests en cours...' : 'Lancer tous les tests'}
              </Button>
              
              <div className="text-sm text-gray-600">
                <p>API Base URL: <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE}</code></p>
                <p>Nombre d'endpoints: {endpoints.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Résultats des Tests</h2>
            
            {results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{result.endpoint}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {result.duration && (
                        <span className="text-sm text-gray-500">
                          {result.duration}ms
                        </span>
                      )}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                </CardHeader>
                
                {result.status === 'success' && result.response && (
                  <CardContent>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Réponse:</h4>
                      <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-60">
                        {JSON.stringify(result.response, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                )}
                
                {result.status === 'error' && (
                  <CardContent>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Erreur:</h4>
                      <p className="text-red-700 text-sm">{result.error}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Informations Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">APIs Intégrées</h4>
                <ul className="space-y-1 text-sm">
                  <li>✅ ANSES RNP Service (Références Nutritionnelles)</li>
                  <li>✅ OpenFoodFacts API (Vérification ingrédients)</li>
                  <li>✅ Spoonacular API (Génération recettes)</li>
                  <li>✅ Unified Nutrition Service (Recherche unifiée)</li>
                  <li>✅ Real-time Tracking Service (Suivi temps réel)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Fonctionnalités Supprimées</h4>
                <ul className="space-y-1 text-sm">
                  <li>❌ CIQUAL API (source de bugs)</li>
                  <li>❌ Services dépendants CIQUAL</li>
                  <li>❌ Endpoints CIQUAL obsolètes</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🎉 Améliorations Apportées</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Suppression complète de CIQUAL (plus de bugs API)</li>
                <li>• Intégration ANSES RNP avec ajustements végétaliens</li>
                <li>• Système de suivi nutritionnel temps réel</li>
                <li>• Génération de recettes intelligente avec Spoonacular</li>
                <li>• Vérification d'ingrédients avec OpenFoodFacts</li>
                <li>• Cache intelligent pour performances optimales</li>
                <li>• Évaluation nutritionnelle scientifiquement rigoureuse</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}