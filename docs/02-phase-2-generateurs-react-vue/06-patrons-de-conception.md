# 06 — Patrons de conception (ajouts et évolutions de la phase 2)

> Les 15 patrons de la phase 1 sont décrits dans [phase 1 › 07](../01-phase-1-modele-pivot-et-editeur/07-patrons-de-conception.md). Ils restent en place.

| # | Patron | Nouveau ou évolution | Où |
|---|---|---|---|
| 1 | **Stratégie** (table de règles) | **Déplacé** du canevas vers `rendu-web`, et partagé | `rendu-web/src/regles.ts` |
| 2 | **Interprète** et **compilateur** de modèle | Le canevas **interprète** ; les générateurs **compilent** | `Canevas.tsx` ; `generateur-*/src/` |
| 3 | **Représentation intermédiaire** (*Intermediate Representation*) | Nouveau | `rendu-web/src/element-web.ts` |
| 4 | **Patron de transformation en chaîne** (*pipeline*) | Nouveau | `arbreWeb` → `lignesJsx` / `lignesTemplate` → fichiers → zip |
| 5 | **Objet lecteur avec valeurs par défaut** | Nouveau | Classe `Lecteur` dans `regles.ts` |
| 6 | **Composite** (parcours récursif) | Réutilisé | `arbreWeb`, `lignesJsx`, `lignesTemplate`, `RenduWeb` |
| 7 | **Adaptateur** + **injection** | Réutilisé pour le téléchargement | `adaptateurs/telechargement.ts` ; prop `telecharger` |
| 8 | **Objet nul / repli** (*Null Object*) | Nouveau, côté canevas | Encadré « Composant inconnu » (`inconnu: 'remplacer'`) |

---

### 1. Stratégie : une table de règles, maintenant partagée
- **Problème** : traduire chaque composant différemment, sans chaîne de `if`.
- **Phase 1** : la table `rendus` vivait **dans** le canevas.
- **Phase 2** : la table `regles` vit dans `rendu-web`. Elle produit des **données** (un élément web) au lieu d'éléments React. Elle sert donc **à la fois** au canevas et aux générateurs (D39).
- **À retenir** : ajouter un composant demande **une entrée** dans `composants-base.ts` (le vocabulaire) et **une entrée** dans `regles.ts` (le rendu web). Rien d'autre : ni le canevas, ni les générateurs, ni la palette, ni le panneau.

### 2. Interprète et compilateur
- **Le canevas interprète** l'arbre web : il l'**exécute** directement, avec un `createElement` par nœud.
- **Les générateurs compilent** l'arbre web : ils le **traduisent en texte**, qui sera exécuté plus tard, ailleurs.
- **Même entrée, même parcours, sortie différente.** C'est exactement la relation entre un interpréteur et un compilateur d'un langage de programmation, et c'est ce qui rend la parité naturelle.

### 3. Représentation intermédiaire
- **Problème** : N sources × M cibles = N × M traducteurs.
- **Solution** : une forme **intermédiaire** commune. Chez nous, N = 1 source (le modèle pivot) et M = 3 consommateurs web (canevas, React, Vue). Les règles « modèle → web » ne sont écrites **qu'une fois** ; chaque consommateur n'apporte que sa syntaxe.
- **Références** : c'est le principe des compilateurs (LLVM IR) et de Mitosis (Builder.io) pour les composants d'interface.

### 4. Transformation en chaîne
- Chaque étape est une **fonction pure** qui prend la sortie de la précédente :
  ```
  document ──arbreWeb──▶ NoeudWeb ──lignesJsx──▶ string[] ──join──▶ App.jsx ──(+ autres fichiers)──▶ FichierGenere[] ──creerZip──▶ octets
  ```
- **Avantage** : chaque étape se teste **seule**. Les tests vérifient l'arbre web, puis le texte, puis le projet, puis le zip.

### 5. Objet lecteur avec valeurs par défaut
- **Problème** : une propriété peut être absente du nœud (documents de la phase 1, D37).
- **Solution** : `new Lecteur(noeud, catalogue)` expose `texte()`, `nombre()` et `booleen()`. Chacune renvoie la valeur du nœud ou, à défaut, celle du **catalogue**. Les règles n'ont jamais à gérer le cas « absent ».
- **Rapprochement** : c'est une petite **Façade** typée sur deux sources (l'instance M1 et son type M2).

### 6. Composite : parcours récursif
- Les trois parcours (`arbreWeb`, `lignesJsx`, `lignesTemplate`) et le composant `RenduWeb` traitent **de la même façon** un élément simple et un conteneur : ils se traitent eux-mêmes, puis s'appellent sur leurs enfants.

### 7. Adaptateur et injection : le téléchargement
- `telechargerZip` **adapte** une liste de fichiers neutre au mécanisme de téléchargement du navigateur (`Blob`, `URL.createObjectURL`, lien `<a download>`).
- L'éditeur la reçoit **en paramètre** (`telecharger`). Dans les tests, une fonction espion (`vi.fn()`) la remplace. C'est le même principe que les ports sortants de la phase 1.

### 8. Repli : « Composant inconnu »
- Au lieu de planter, le canevas affiche un élément de **remplacement** qui se comporte comme un nœud normal (sélectionnable, supprimable). Les générateurs, eux, **refusent** (D46). Le même code gère les deux comportements grâce à une option.
