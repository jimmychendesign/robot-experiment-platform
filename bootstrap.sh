#!/bin/bash

set -e

echo "Creating missing project structure..."

mkdir -p app public assets docs prompts
mkdir -p output/html output/pdf output/screenshots output/exports

TODAY=$(date +%F)
mkdir -p "sessions/$TODAY"

touch docs/research.md docs/notes.md docs/architecture.md docs/design.md docs/README.md
touch docs/product-overview.md docs/prd.md docs/feature-list.md docs/user-flow.md docs/business-rules.md
touch docs/roles-permissions.md docs/states.md docs/decisions.md docs/changelog.md
touch prompts/coding.md prompts/ui.md prompts/visualization.md prompts/summary.md prompts/brainstorming.md
touch "sessions/$TODAY/session.md" "sessions/$TODAY/prompts.md" "sessions/$TODAY/summary.md" "sessions/$TODAY/todo.md"
touch output/html/.gitkeep output/pdf/.gitkeep output/screenshots/.gitkeep output/exports/.gitkeep assets/.gitkeep

echo "Project structure is ready."
echo "Today's session: sessions/$TODAY/"
