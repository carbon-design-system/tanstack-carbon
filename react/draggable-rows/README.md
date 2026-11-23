# Draggable rows

Reorder rows in a Carbon `DataTable` driven by `@tanstack/react-table`, from the
row overflow menu or by drag and drop.

## Move rows from the overflow menu

Each row has an overflow menu with three actions:

- **Move up** and **Move down** shift the row one position. They are disabled at
  the first and last position.
- **Move to custom position** opens a dialog with a number input. Enter a
  position from 1 to the total number of rows, then select **Move**.

All three actions call the same `moveRow(id, newIndex)` function, which reorders
the `data` state with `arrayMove`. The table is paginated, so when a row moves
onto another page, the table switches to that page and the row stays in view.

## Drag and drop

Drag and drop uses [dnd-kit](https://dndkit.com/), because TanStack Table does
not ship any drag and drop logic. Drag a row by its drag icon. A `DragOverlay`
follows the pointer while the original row shows where it will be dropped.

The keyboard sensor lets you reorder without a pointer:

1. Focus the drag icon with <kbd>Tab</kbd>.
2. Press <kbd>Space</kbd> or <kbd>Enter</kbd> to pick up the row.
3. Use <kbd>↑</kbd> and <kbd>↓</kbd> to move it.
4. Press <kbd>Space</kbd> or <kbd>Enter</kbd> to drop it, or <kbd>Esc</kbd> to
   cancel.

## Motion

Row transitions and the drop animation use Carbon motion tokens from
`@carbon/motion`. They are turned off when the user prefers reduced motion.

## Project structure

```text
src/Example/
├── DraggableRows.tsx           # table setup, state, drag handlers, layout
├── constants.ts                # page size, row count, motion tokens
├── utils.ts                    # pinned column class name
├── hooks/
│   └── usePrefersReducedMotion.ts
└── components/
    ├── RowActions.tsx          # overflow menu
    ├── DraggableRow.tsx        # sortable row and its cells
    ├── MoveToPositionModal.tsx # custom position dialog
    └── RowDragOverlay.tsx      # row copy that follows the pointer
```

## Typings for `@carbon/motion`

`@carbon/motion` does not ship type declarations, so `src/carbon-motion.d.ts`
declares the exports that the example uses. If you copy this example, copy that
file too.

## Run locally

```bash
cd react/draggable-rows
yarn install
yarn dev
```
