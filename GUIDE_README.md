# 📋 Système de Guide Utilisateur

Ce dossier contient le système de guide automatisé pour VeganFlemme App.

## Fichiers

### `GUIDE_UTILISATEUR.md`
Guide principal en français qui liste toutes les tâches que l'utilisateur doit faire manuellement, organisé par priorité et phase de développement.

**Caractéristiques :**
- Mis à jour automatiquement à chaque session
- Instructions détaillées étape par étape
- Tracking de progression avec checkboxes
- Séparation claire entre tâches utilisateur et automatisées
- Planning réaliste avec estimations de temps

### `.guide_status.md`
Fichier de statut technique (exclu du git) qui permet le suivi automatique de la progression.

### `scripts/update-guide.sh`
Script bash pour automatiser les mises à jour du guide :
- Mise à jour des dates
- Marquage des tâches terminées
- Ajout de notes urgentes
- Mise à jour des statuts JSON

## Utilisation

### Pour l'AI
```bash
# Mettre à jour la date du guide
./scripts/update-guide.sh update-date

# Marquer une tâche comme terminée
./scripts/update-guide.sh complete-task "Configuration base de données"

# Ajouter une note urgente
./scripts/update-guide.sh add-urgent "Valider les clés API avant vendredi"
```

### Pour l'utilisateur
1. Consulter `GUIDE_UTILISATEUR.md` pour voir les tâches à faire
2. Cocher manuellement les tâches accomplies
3. Communiquer les clés/infos nécessaires
4. Signaler les blocages ou difficultés

## Principe

**L'AI gère :** Développement, tests, déploiements, implémentation technique
**L'utilisateur gère :** Configurations externes, contenus, validations légales, tests utilisateurs

Le guide est mis à jour automatiquement pour refléter l'avancement du projet et prioriser les prochaines actions de l'utilisateur.

---

*Système créé le 2024-01-18 pour optimiser la collaboration human-AI sur le projet VeganFlemme.*