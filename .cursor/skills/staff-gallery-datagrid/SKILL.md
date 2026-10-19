---
name: staff-gallery-datagrid
description: Converts a staff CMS tab to StaffGalleryDataGrid, the parchment DataGrid with a space-between toolbar. Use when the user asks to add this datagrid, this grid style, or the Hover Slides / Home Page / Downloadable Links / Instruction images layout to another staff page or gallery tab.
---

# Staff gallery DataGrid

Use `frontend/components/staff/gallery/StaffGalleryDataGrid.js`. Do not build a new grid, MUI Table, card list, or `@dnd-kit` list for this look.

## Layout

- Left slot: `toolbarStart` (selector, helper text, or both).
- Right slot: `actions`. Omit `variant` for an outlined button. `variant: 'primary'` is the black **Save** button.
- Put **Save** last, with `startIcon: <SaveIcon />` from `@mui/icons-material/Save`.
- File actions that match Downloadable Links use `galleryChooseFileButtonSx` and `gallerySaveButtonSx` from `gallery-staff-helpers.js`. Do not restyle that pair inline.
- Create actions use `startIcon: <AddIcon />`.
- Show create and save actions only when `canEdit` is true.
- Drop introductory sentences only when the user asks to remove that copy.

## Usage

```jsx
<StaffGalleryDataGrid
  rows={rows}
  columns={columns}
  getRowId={row => String(row.id)}
  rowHeight={88}
  rowReordering={canEdit && !saving}
  onRowOrderChange={handleRowOrderChange}
  localeText={{ noRowsLabel: 'No rows yet.' }}
  toolbarStart={/* select or short text */}
  actions={
    canEdit
      ? [
          { key: 'new', label: 'New item', startIcon: <AddIcon />, onClick: openCreate, disabled: saving },
          {
            key: 'save',
            label: saving ? 'Saving…' : 'Save',
            startIcon: <SaveIcon />,
            onClick: handleSave,
            disabled: saving,
            variant: 'primary',
          },
        ]
      : []
  }
/>
```

Other `DataGridPremium` props pass through (`loading`, `sx`, `slots`). `sx` is merged with `galleryDataGridSx`. When adding cell styles, keep `display: 'flex'` and `alignItems: 'center'` so row content stays vertically centered.

## Rows

- Columns: `sortable: false`, `filterable: false`, `disableColumnMenu: true`.
- Image rows: preview about 120×72, `rowHeight={88}`, `objectFit: 'cover'` or `'contain'` to match the old card.
- Editable alt or label fields use `GalleryTextField` with `size="small"` and `sx={{ my: 0, width: '100%' }}`.
- Remove control is a trailing icon button, only when `canEdit`.
- Reorder with `rowReordering` and `onRowOrderChange`. Keep the page’s existing persist behavior: some tabs save order immediately, others keep it local until **Save**.

## Already converted

- `HoverSlidesTab.js`
- `HomeLandingImagesTab.js`
- `SiteDocumentsTab.js`
- `ProductManualInstructionImagesPanel.js`
- `ProductManualsTab.js`
- `DealersTab.js`
- `BoutiqueDevelopersTab.js`
- `BlogPostsTab.js`
- `NewsArticlesTab.js`
- `LookbooksTab.js`
- `PrintPublicationsTab.js`
- `SubCollectionDetailPanel.js`
