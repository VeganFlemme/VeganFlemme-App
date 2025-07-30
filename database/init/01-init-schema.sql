-- ===================================================================
-- 🗄️ VeganFlemme Database - Schema Initialization
-- ===================================================================
-- Script d'initialisation PostgreSQL pour le développement local
-- Exécuté automatiquement au premier démarrage du conteneur
-- ===================================================================

-- Activer les extensions PostgreSQL utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- 👤 USERS TABLE - Profils utilisateurs
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    
    -- Données personnelles
    age INTEGER,
    gender VARCHAR(20),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    activity_level VARCHAR(20),
    goals VARCHAR(50),
    
    -- Préférences alimentaires
    dietary_restrictions JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    cuisine_preferences JSONB DEFAULT '[]',
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- ===================================================================
-- 🥗 FOODS TABLE - Base de données alimentaire
-- ===================================================================
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    
    -- Données nutritionnelles (pour 100g)
    calories DECIMAL(8,2) NOT NULL,
    protein DECIMAL(6,2) NOT NULL,
    carbohydrates DECIMAL(6,2) NOT NULL,
    fat DECIMAL(6,2) NOT NULL,
    fiber DECIMAL(6,2),
    sugar DECIMAL(6,2),
    sodium DECIMAL(8,2),
    
    -- Micronutriments (optionnel)
    vitamins JSONB DEFAULT '{}',
    minerals JSONB DEFAULT '{}',
    
    -- Données qualité
    nutri_score CHAR(1),
    eco_score CHAR(2),
    nova_class INTEGER,
    
    -- Données produit
    organic BOOLEAN DEFAULT false,
    price_per_100g DECIMAL(6,2),
    carbon_footprint DECIMAL(8,3),
    
    -- Sources de données
    ciqual_code VARCHAR(20),
    open_food_facts_id VARCHAR(100),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 📋 MENUS TABLE - Menus générés
-- ===================================================================
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Configuration du menu
    days_count INTEGER NOT NULL,
    people_count INTEGER NOT NULL,
    budget_level VARCHAR(20),
    cooking_time VARCHAR(20),
    
    -- Données générées
    menu_data JSONB NOT NULL,
    nutritional_summary JSONB,
    total_cost DECIMAL(8,2),
    carbon_footprint DECIMAL(8,3),
    
    -- Métadonnées
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ===================================================================
-- 🔍 INDEXES pour les performances
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_nutri_score ON foods(nutri_score);
CREATE INDEX IF NOT EXISTS idx_foods_name_search ON foods USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_generated_at ON menus(generated_at);

-- ===================================================================
-- 🌱 SEED DATA - Données de base pour le développement
-- ===================================================================

-- Insérer quelques aliments de base
INSERT INTO foods (name, category, calories, protein, carbohydrates, fat, fiber, nutri_score, eco_score, nova_class, organic) VALUES
('Tofu nature', 'Protéines végétales', 76, 8.1, 1.9, 4.8, 0.4, 'A', 'A+', 2, true),
('Lentilles corail', 'Légumineuses', 116, 9.0, 20.1, 0.4, 7.9, 'A', 'A+', 1, false),
('Quinoa', 'Céréales', 368, 14.1, 64.2, 6.1, 7.0, 'A', 'B', 1, true),
('Avocat', 'Fruits', 160, 2.0, 8.5, 14.7, 6.7, 'C', 'C', 1, false),
('Épinards frais', 'Légumes', 23, 2.9, 3.6, 0.4, 2.2, 'A', 'A+', 1, true),
('Amandes', 'Fruits à coque', 579, 21.2, 21.6, 49.9, 12.5, 'B', 'B', 1, false)
ON CONFLICT DO NOTHING;

-- Créer un utilisateur de démonstration
INSERT INTO users (email, username, age, gender, weight, height, activity_level, goals) VALUES
('demo@veganflemme.com', 'demo_user', 28, 'female', 65.0, 168.0, 'moderate', 'maintain')
ON CONFLICT (email) DO NOTHING;

-- ===================================================================
-- 📊 ANALYTICS VIEWS (optionnel)
-- ===================================================================

-- Vue pour les statistiques d'utilisation
CREATE OR REPLACE VIEW user_menu_stats AS
SELECT 
    u.id as user_id,
    u.username,
    COUNT(m.id) as total_menus,
    AVG(m.total_cost) as avg_cost,
    MAX(m.generated_at) as last_menu_date
FROM users u
LEFT JOIN menus m ON u.id = m.user_id
GROUP BY u.id, u.username;

-- ===================================================================
-- 🔧 FUNCTIONS utilitaires
-- ===================================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger aux tables appropriées
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_foods_updated_at ON foods;
CREATE TRIGGER update_foods_updated_at
    BEFORE UPDATE ON foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ✅ PERMISSIONS (sécurité basique)
-- ===================================================================

-- Créer un rôle pour l'application
CREATE ROLE veganflemme_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO veganflemme_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO veganflemme_app;

-- Confirmer la création du schéma
\echo 'VeganFlemme database schema initialized successfully! 🌱'