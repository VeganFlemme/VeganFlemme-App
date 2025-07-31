#!/bin/bash

# Script de mise à jour automatique du guide utilisateur
# Utilisé par l'AI pour maintenir le guide à jour

GUIDE_FILE="/home/runner/work/VeganFlemme-App/VeganFlemme-App/GUIDE_UTILISATEUR.md"
STATUS_FILE="/home/runner/work/VeganFlemme-App/VeganFlemme-App/.guide_status.md"

# Fonction pour mettre à jour la date dans le guide
update_guide_date() {
    local current_date=$(date +"%Y-%m-%d")
    sed -i "s/\*\*Dernière mise à jour :\*\* [0-9-]*/\*\*Dernière mise à jour :\*\* $current_date/" "$GUIDE_FILE"
}

# Fonction pour marquer une tâche comme terminée
mark_task_completed() {
    local task_name="$1"
    sed -i "s/- \[ \] $task_name/- [x] $task_name/" "$GUIDE_FILE"
}

# Fonction pour ajouter une note urgente
add_urgent_note() {
    local note="$1"
    echo "- 🚨 **URGENT :** $note" >> "$STATUS_FILE"
}

# Fonction pour mettre à jour le statut JSON
update_status_json() {
    local phase="$1"
    local completed="$2"
    local total="$3"
    
    # Mise à jour basique du fichier de statut
    current_date=$(date +"%Y-%m-%d")
    sed -i "s/\"Date :\" [0-9-]*/\"Date :\" $current_date/" "$STATUS_FILE"
}

# Affichage de l'utilisation
if [ "$#" -eq 0 ]; then
    echo "Usage: $0 [update-date|complete-task|add-urgent|update-status]"
    echo "  update-date                    - Met à jour la date du guide"
    echo "  complete-task 'nom_tâche'      - Marque une tâche comme terminée"
    echo "  add-urgent 'message'           - Ajoute une note urgente"
    echo "  update-status phase completed total - Met à jour le statut JSON"
    exit 1
fi

case "$1" in
    "update-date")
        update_guide_date
        echo "Date mise à jour dans le guide utilisateur"
        ;;
    "complete-task")
        if [ -z "$2" ]; then
            echo "Erreur: Nom de tâche requis"
            exit 1
        fi
        mark_task_completed "$2"
        echo "Tâche '$2' marquée comme terminée"
        ;;
    "add-urgent")
        if [ -z "$2" ]; then
            echo "Erreur: Message requis"
            exit 1
        fi
        add_urgent_note "$2"
        echo "Note urgente ajoutée: $2"
        ;;
    "update-status")
        if [ "$#" -ne 4 ]; then
            echo "Erreur: update-status nécessite 3 paramètres (phase completed total)"
            exit 1
        fi
        update_status_json "$2" "$3" "$4"
        echo "Statut JSON mis à jour"
        ;;
    *)
        echo "Commande inconnue: $1"
        exit 1
        ;;
esac