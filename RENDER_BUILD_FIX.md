# 🔧 Fix Render Build Error: "cd: engine: No such file or directory"

## ❌ Problème

Le build Render échoue avec l'erreur suivante :
```bash
bash: line 1: cd: engine: No such file or directory
```

## 🔍 Cause Racine

Cette erreur se produit quand il y a un conflit de configuration entre :
1. Le **Root Directory** configuré dans le dashboard Render
2. La **Build Command** qui essaie de faire `cd engine`

### Scénario Problématique
- **Root Directory** : `engine` (dans le dashboard Render)
- **Build Command** : `cd engine && npm run build:render`

➡️ **Résultat** : Render démarre déjà dans le dossier `engine/`, donc `cd engine` essaie d'aller dans `engine/engine/` qui n'existe pas.

## ✅ Solution

### Option 1: Utiliser render.yaml (Recommandé)

Le fichier `render.yaml` à la racine du repository spécifie la configuration correcte :

```yaml
services:
  - type: web
    name: veganflemme-engine
    env: node
    region: frankfurt
    plan: starter
    rootDir: .  # Racine du repository
    buildCommand: cd engine && npm run build:render
    startCommand: cd engine && npm start
```

**Actions requises :**
1. S'assurer que Render utilise le fichier `render.yaml`
2. Ne pas override manuellement la configuration dans le dashboard

### Option 2: Configuration Manuelle Dashboard

Si vous préférez configurer manuellement dans le dashboard Render :

```bash
Name: veganflemme-engine
Environment: Node
Region: Frankfurt
Branch: main
Root Directory: (laisser VIDE)
Build Command: cd engine && npm run build:render
Start Command: cd engine && npm start
```

⚠️ **CRUCIAL** : Le Root Directory doit être vide (pointe vers la racine du repository).

## 🧪 Test de Validation

Pour tester que la configuration fonctionne :

```bash
# Depuis la racine du repository
cd VeganFlemme-App

# Simuler la commande Render
cd engine && npm run build:render
```

Cette commande doit s'exécuter sans erreur et produire le dossier `dist/`.

## 📋 Checklist de Résolution

- [ ] Vérifier que le dossier `engine/` existe à la racine du repository
- [ ] Confirmer que `render.yaml` existe et contient `rootDir: .`
- [ ] S'assurer que Root Directory est vide dans le dashboard Render
- [ ] Vérifier que Build Command est : `cd engine && npm run build:render`
- [ ] Tester le build localement avec la commande exacte
- [ ] Redéployer le service sur Render

## 🛠️ Scripts de Build Améliorés

Le script `engine/scripts/build-render.sh` a été amélioré pour détecter automatiquement le répertoire de travail et afficher des informations de debug utiles.

## 📞 Si le Problème Persiste

1. **Vérifier les logs Render** pour voir exactement quelle commande est exécutée
2. **Supprimer et recréer le service** avec la bonne configuration
3. **Contacter le support Render** si render.yaml n'est pas respecté

---

✅ **Avec cette configuration, le build Render devrait fonctionner parfaitement !** 🚀