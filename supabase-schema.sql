-- ===================================================================
-- 🌱 VeganFlemme Database - Complete Schema for Supabase
-- ===================================================================
-- Execute this script directly in Supabase SQL Editor
-- This script contains the complete database schema ready for production
-- 
-- ✅ FIXED: All policies use DROP POLICY IF EXISTS to prevent conflicts
-- This script can be run multiple times safely without errors
-- ===================================================================

-- Enable PostgreSQL extensions (Supabase usually has these enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- 👤 USERS TABLE - User profiles
-- ===================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    
    -- Personal data
    age INTEGER,
    gender VARCHAR(20),
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    activity_level VARCHAR(20),
    goals VARCHAR(50),
    
    -- Dietary preferences
    dietary_restrictions JSONB DEFAULT '[]',
    allergies JSONB DEFAULT '[]',
    cuisine_preferences JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- ===================================================================
-- 🥗 FOODS TABLE - Food database
-- ===================================================================
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    
    -- Nutritional data (per 100g)
    calories DECIMAL(8,2) NOT NULL,
    protein DECIMAL(6,2) NOT NULL,
    carbohydrates DECIMAL(6,2) NOT NULL,
    fat DECIMAL(6,2) NOT NULL,
    fiber DECIMAL(6,2),
    sugar DECIMAL(6,2),
    sodium DECIMAL(8,2),
    
    -- Micronutrients (optional)
    vitamins JSONB DEFAULT '{}',
    minerals JSONB DEFAULT '{}',
    
    -- Quality data
    nutri_score CHAR(1),
    eco_score CHAR(2),
    nova_class INTEGER,
    
    -- Product data
    organic BOOLEAN DEFAULT false,
    price_per_100g DECIMAL(6,2),
    carbon_footprint DECIMAL(8,3),
    
    -- Data sources
    ciqual_code VARCHAR(20),
    open_food_facts_id VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 📋 MENUS TABLE - Generated menus
-- ===================================================================
CREATE TABLE IF NOT EXISTS menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Menu configuration
    days_count INTEGER NOT NULL,
    people_count INTEGER NOT NULL,
    budget_level VARCHAR(20),
    cooking_time VARCHAR(20),
    
    -- Generated data
    menu_data JSONB NOT NULL,
    nutritional_summary JSONB,
    total_cost DECIMAL(8,2),
    carbon_footprint DECIMAL(8,3),
    
    -- Metadata
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ===================================================================
-- 🍽️ RECIPES TABLE - Recipe collection
-- ===================================================================
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER NOT NULL,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    
    -- Recipe metadata
    tags VARCHAR(100)[],
    meal_type VARCHAR(50)[] CHECK (meal_type <@ ARRAY['breakfast', 'lunch', 'dinner', 'snack']::VARCHAR(50)[]),
    cuisine_type VARCHAR(100),
    image_url VARCHAR(500),
    
    -- Nutritional information per serving
    calories_per_serving INTEGER,
    protein_per_serving DECIMAL(5,2),
    carbs_per_serving DECIMAL(5,2),
    fat_per_serving DECIMAL(5,2),
    fiber_per_serving DECIMAL(5,2),
    
    -- Quality metrics
    average_rating DECIMAL(2,1) DEFAULT 0.0,
    total_ratings INTEGER DEFAULT 0,
    
    -- Source information
    source_url VARCHAR(500),
    author VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 🛒 SHOPPING LISTS TABLE - User shopping lists
-- ===================================================================
CREATE TABLE IF NOT EXISTS shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    menu_id UUID REFERENCES menus(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 🛍️ SHOPPING LIST ITEMS TABLE - Items in shopping lists
-- ===================================================================
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    estimated_price DECIMAL(6,2),
    is_purchased BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 📊 MEAL PLANS TABLE - User meal plans
-- ===================================================================
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 🍽️ MEALS TABLE - Individual meals in meal plans
-- ===================================================================
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    meal_type VARCHAR(50) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    servings INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 📋 TRANSITION TASKS TABLE - User transition tasks
-- ===================================================================
CREATE TABLE IF NOT EXISTS transition_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    estimated_time INTEGER, -- in minutes
    due_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 💬 COMMUNITY POSTS TABLE - User community posts
-- ===================================================================
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_urls TEXT[],
    tags VARCHAR(100)[],
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 💬 COMMENTS TABLE - Comments on community posts
-- ===================================================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 👍 POST LIKES TABLE - Junction table for post likes
-- ===================================================================
CREATE TABLE IF NOT EXISTS post_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- ===================================================================
-- 📊 NUTRITION TRACKERS TABLE - Daily nutrition tracking
-- ===================================================================
CREATE TABLE IF NOT EXISTS nutrition_trackers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- ===================================================================
-- 🍽️ TRACKED MEALS TABLE - Meals tracked for nutrition
-- ===================================================================
CREATE TABLE IF NOT EXISTS tracked_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracker_id UUID REFERENCES nutrition_trackers(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    custom_name VARCHAR(255),
    meal_type VARCHAR(50) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    servings INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 🧮 TRACKED MEAL NUTRIENTS TABLE - Nutritional data for tracked meals
-- ===================================================================
CREATE TABLE IF NOT EXISTS tracked_meal_nutrients (
    meal_id UUID PRIMARY KEY REFERENCES tracked_meals(id) ON DELETE CASCADE,
    calories INTEGER NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    fiber DECIMAL(5,2) NOT NULL,
    sugar DECIMAL(5,2),
    sodium DECIMAL(5,2),
    vitamin_b12 DECIMAL(5,2),
    iron DECIMAL(5,2),
    calcium DECIMAL(5,2),
    omega3 DECIMAL(5,2)
);

-- ===================================================================
-- 📈 USER PROGRESS TABLE - User progress tracking
-- ===================================================================
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    actions_completed INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- ===================================================================
-- 📚 EDUCATION RESOURCES TABLE - Educational content
-- ===================================================================
CREATE TABLE IF NOT EXISTS education_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content_type VARCHAR(50) CHECK (content_type IN ('article', 'video', 'infographic', 'quiz')),
    url VARCHAR(255) NOT NULL,
    transition_stage VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    tags VARCHAR(100)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================================
-- 📖 USER RESOURCE PROGRESS TABLE - User progress on educational resources
-- ===================================================================
CREATE TABLE IF NOT EXISTS user_resource_progress (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES education_resources(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    PRIMARY KEY (user_id, resource_id)
);

-- ===================================================================
-- 🔍 INDEXES for performance optimization
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);
CREATE INDEX IF NOT EXISTS idx_foods_nutri_score ON foods(nutri_score);
CREATE INDEX IF NOT EXISTS idx_foods_name_search ON foods USING gin(to_tsvector('french', name));
CREATE INDEX IF NOT EXISTS idx_menus_user_id ON menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_generated_at ON menus(generated_at);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes USING GIN(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_average_rating ON recipes(average_rating);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_transition_tasks_due_date ON transition_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_category ON shopping_list_items(category);

-- ===================================================================
-- 🌱 SEED DATA - Base data for development and testing
-- ===================================================================

-- Insert basic food items
INSERT INTO foods (name, category, calories, protein, carbohydrates, fat, fiber, nutri_score, eco_score, nova_class, organic) VALUES
('Tofu nature', 'Protéines végétales', 76, 8.1, 1.9, 4.8, 0.4, 'A', 'A+', 2, true),
('Lentilles corail', 'Légumineuses', 116, 9.0, 20.1, 0.4, 7.9, 'A', 'A+', 1, false),
('Quinoa', 'Céréales', 368, 14.1, 64.2, 6.1, 7.0, 'A', 'B', 1, true),
('Avocat', 'Fruits', 160, 2.0, 8.5, 14.7, 6.7, 'C', 'C', 1, false),
('Épinards frais', 'Légumes', 23, 2.9, 3.6, 0.4, 2.2, 'A', 'A+', 1, true),
('Amandes', 'Fruits à coque', 579, 21.2, 21.6, 49.9, 12.5, 'B', 'B', 1, false),
('Tempeh', 'Protéines végétales', 190, 19.0, 9.4, 11.0, 9.0, 'A', 'A+', 2, true),
('Pois chiches', 'Légumineuses', 164, 8.9, 27.4, 2.6, 7.6, 'A', 'A+', 1, false),
('Sarrasin', 'Céréales', 343, 13.2, 71.5, 3.4, 10.0, 'A', 'A+', 1, true),
('Brocoli', 'Légumes', 34, 2.8, 7.0, 0.4, 2.6, 'A', 'A+', 1, false)
ON CONFLICT DO NOTHING;

-- Create demo user
INSERT INTO users (email, username, age, gender, weight, height, activity_level, goals) VALUES
('demo@veganflemme.com', 'demo_user', 28, 'female', 65.0, 168.0, 'moderate', 'maintain')
ON CONFLICT (email) DO NOTHING;

-- Insert sample recipes
INSERT INTO recipes (name, description, instructions, prep_time, cook_time, servings, difficulty, tags, meal_type, cuisine_type, calories_per_serving, protein_per_serving, carbs_per_serving, fat_per_serving, fiber_per_serving) VALUES
('Buddha Bowl au Quinoa', 'Un bowl complet et nutritif avec quinoa, légumes grillés et sauce tahini', 'Cuire le quinoa. Griller les légumes. Préparer la sauce. Assembler dans un bol.', 15, 25, 2, 'easy', ARRAY['healthy', 'vegan', 'gluten-free'], ARRAY['lunch', 'dinner'], 'Mediterranean', 420, 16.5, 58.0, 18.2, 12.0),
('Smoothie Vert Protéiné', 'Smoothie vert riche en protéines avec épinards, banane et graines', 'Mixer tous les ingrédients jusqu''à obtenir une texture lisse.', 5, 0, 1, 'easy', ARRAY['breakfast', 'healthy', 'quick'], ARRAY['breakfast', 'snack'], 'International', 280, 12.0, 45.0, 8.5, 9.0),
('Curry de Lentilles', 'Curry épicé aux lentilles corail et lait de coco', 'Faire revenir les oignons. Ajouter les épices. Incorporer les lentilles et le lait de coco. Mijoter 20 minutes.', 10, 30, 4, 'medium', ARRAY['spicy', 'comfort-food', 'gluten-free'], ARRAY['lunch', 'dinner'], 'Indian', 320, 14.8, 42.0, 8.0, 11.5)
ON CONFLICT DO NOTHING;

-- Insert educational resources
INSERT INTO education_resources (title, description, content_type, url, transition_stage, category, tags) VALUES
('Guide de la transition végane', 'Guide complet pour débuter sereinement sa transition vers une alimentation végétale', 'article', '/resources/guide-transition-vegane', 'beginner', 'Nutrition', ARRAY['transition', 'beginner', 'guide']),
('Protéines végétales: mythes et réalités', 'Tout savoir sur les protéines végétales et leur assimilation', 'article', '/resources/proteines-vegetales', 'intermediate', 'Nutrition', ARRAY['proteins', 'science', 'nutrition']),
('Planifier ses menus de la semaine', 'Vidéo tutoriel pour organiser efficacement ses repas végans', 'video', '/resources/planifier-menus', 'beginner', 'Meal Planning', ARRAY['planning', 'organization', 'weekly'])
ON CONFLICT DO NOTHING;

-- ===================================================================
-- 📊 ANALYTICS VIEWS (for business intelligence)
-- ===================================================================

-- User engagement statistics
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

-- Recipe popularity view
CREATE OR REPLACE VIEW recipe_popularity AS
SELECT 
    r.id,
    r.name,
    r.average_rating,
    r.total_ratings,
    COUNT(m.recipe_id) as times_used_in_meals
FROM recipes r
LEFT JOIN meals m ON r.id = m.recipe_id
GROUP BY r.id, r.name, r.average_rating, r.total_ratings
ORDER BY r.average_rating DESC, times_used_in_meals DESC;

-- ===================================================================
-- 🔧 UTILITY FUNCTIONS
-- ===================================================================

-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to appropriate tables
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

DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shopping_lists_updated_at ON shopping_lists;
CREATE TRIGGER update_shopping_lists_updated_at
    BEFORE UPDATE ON shopping_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;
CREATE TRIGGER update_meal_plans_updated_at
    BEFORE UPDATE ON meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transition_tasks_updated_at ON transition_tasks;
CREATE TRIGGER update_transition_tasks_updated_at
    BEFORE UPDATE ON transition_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 🔐 ROW LEVEL SECURITY (RLS) Setup for Supabase
-- ===================================================================

-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resource_progress ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own data)
-- Note: Use DROP POLICY IF EXISTS to avoid conflicts if policies already exist
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can access own menus" ON menus;
DROP POLICY IF EXISTS "Users can access own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can access own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can access own transition tasks" ON transition_tasks;
DROP POLICY IF EXISTS "Users can access own nutrition trackers" ON nutrition_trackers;
DROP POLICY IF EXISTS "Users can access own progress" ON user_progress;

CREATE POLICY "Users can access own menus" ON menus FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own shopping lists" ON shopping_lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own meal plans" ON meal_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own transition tasks" ON transition_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own nutrition trackers" ON nutrition_trackers FOR ALL USING (auth.uid() = user_id);
-- Apply policies for meal-related tables that may reference menus
DROP POLICY IF EXISTS "Users can access own meals" ON meals;
DROP POLICY IF EXISTS "Users can access own shopping list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can access own user resource progress" ON user_resource_progress;
DROP POLICY IF EXISTS "Users can access own tracked meals" ON tracked_meals;
DROP POLICY IF EXISTS "Users can access own post likes" ON post_likes;

CREATE POLICY "Users can access own meals" ON meals FOR ALL USING (
    meal_plan_id IN (SELECT id FROM meal_plans WHERE user_id = auth.uid())
);
CREATE POLICY "Users can access own shopping list items" ON shopping_list_items FOR ALL USING (
    shopping_list_id IN (SELECT id FROM shopping_lists WHERE user_id = auth.uid())
);
CREATE POLICY "Users can access own user resource progress" ON user_resource_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own tracked meals" ON tracked_meals FOR ALL USING (
    tracker_id IN (SELECT id FROM nutrition_trackers WHERE user_id = auth.uid())
);
CREATE POLICY "Users can access own post likes" ON post_likes FOR ALL USING (auth.uid() = user_id);

-- Public read access for shared resources
DROP POLICY IF EXISTS "Public read access to foods" ON foods;
DROP POLICY IF EXISTS "Public read access to recipes" ON recipes;
DROP POLICY IF EXISTS "Public read access to education resources" ON education_resources;

CREATE POLICY "Public read access to foods" ON foods FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to recipes" ON recipes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read access to education resources" ON education_resources FOR SELECT TO anon, authenticated USING (true);

-- Community features - public read, authenticated write
DROP POLICY IF EXISTS "Public read access to community posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can edit own posts" ON community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON community_posts;

CREATE POLICY "Public read access to community posts" ON community_posts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own posts" ON community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read access to comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can edit own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

CREATE POLICY "Public read access to comments" ON comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===================================================================
-- ✅ VERIFICATION & COMPLETION MESSAGE
-- ===================================================================

-- Verify tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
        'users', 'foods', 'menus', 'recipes', 'shopping_lists', 
        'shopping_list_items', 'meal_plans', 'meals', 'transition_tasks',
        'community_posts', 'comments', 'post_likes', 'nutrition_trackers',
        'tracked_meals', 'tracked_meal_nutrients', 'user_progress',
        'education_resources', 'user_resource_progress'
    );
    
    IF table_count = 18 THEN
        RAISE NOTICE '✅ VeganFlemme database schema successfully created! All % tables are ready.', table_count;
    ELSE
        RAISE WARNING '⚠️  Only % out of 18 expected tables were created. Please check for errors.', table_count;
    END IF;
END $$;

-- ===================================================================
-- 🎉 INSTALLATION COMPLETE
-- ===================================================================
-- Your VeganFlemme database is now ready for production!
-- Next steps:
-- 1. Configure your application's DATABASE_URL
-- 2. Set up authentication with Supabase Auth
-- 3. Add your SPOONACULAR_API_KEY for recipe integration
-- 4. Configure AMAZON_AFFILIATE_ID for monetization
-- ===================================================================