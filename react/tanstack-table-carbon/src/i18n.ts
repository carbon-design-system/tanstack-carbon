import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      table: {
        columns: {
          name: 'Name',
          email: 'Email',
          role: 'Role',
          status: 'Status',
          age: 'Age',
          department: 'Department',
          salary: 'Salary',
          joinDate: 'Join Date',
        },
        roles: {
          admin: 'Admin',
          user: 'User',
          manager: 'Manager',
          developer: 'Developer',
        },
        statuses: {
          active: 'Active',
          inactive: 'Inactive',
        },
        departments: {
          engineering: 'Engineering',
          sales: 'Sales',
          marketing: 'Marketing',
          hr: 'HR',
        },
        toolbar: {
          filterTooltip: 'Filter',
          settingsTooltip: 'Settings',
          searchPlaceholder: 'Search...',
          columnSettings: 'Column Settings',
        },
        pagination: {
          previous: 'Previous',
          next: 'Next',
          itemsPerPage: 'Items per page',
          itemRange: '{min}–{max} of {total} items',
          items: '{min}–{max} items',
          pageRange: 'of {total} pages',
          page: 'page {page}',
          pageUnknown: 'page',
        },
        emptyState: {
          title: 'No data available',
          subtitle: 'Try adjusting your filters',
        },
        filterPanel: {
          title: 'Filters',
          close: 'Close',
          advancedFilters: 'Advanced Filters',
          searchLabel: 'Search filters',
          searchPlaceholder: 'Search...',
          clearSearchTooltip: 'Clear search',
          apply: 'Apply',
          clear: 'Clear',
          noFilters: 'No filters available',
          fieldFallback: 'Field',
          fieldPlaceholder: 'Select...',
          fieldNoMatch: 'No matches found',
          fieldNoOptions: 'No options available',
          dropdownLabel: 'Select value',
          multiSelectLabel: 'Select values',
          dateRangeEndLabel: 'End date',
          numberInvalidError: 'Invalid number',
          sliderNoValues: 'No values available',
        },
        columnCustomization: {
          title: 'Customize Columns',
          description: 'Select columns to display',
          searchPlaceholder: 'Search columns...',
          selectAll: 'Select all',
          apply: 'Apply',
          cancel: 'Cancel',
        },
      },
    },
  },
  de: {
    translation: {
      table: {
        columns: {
          name: 'Name',
          email: 'E-Mail',
          role: 'Rolle',
          status: 'Status',
          age: 'Alter',
          department: 'Abteilung',
          salary: 'Gehalt',
          joinDate: 'Eintrittsdatum',
        },
        roles: {
          admin: 'Administrator',
          user: 'Benutzer',
          manager: 'Manager',
          developer: 'Entwickler',
        },
        statuses: {
          active: 'Aktiv',
          inactive: 'Inaktiv',
        },
        departments: {
          engineering: 'Technik',
          sales: 'Vertrieb',
          marketing: 'Marketing',
          hr: 'Personalwesen',
        },
        toolbar: {
          filterTooltip: 'Filter',
          settingsTooltip: 'Einstellungen',
          searchPlaceholder: 'Suchen...',
          columnSettings: 'Spalteneinstellungen',
        },
        pagination: {
          previous: 'Zurück',
          next: 'Weiter',
          itemsPerPage: 'Einträge pro Seite',
          itemRange: '{min}–{max} von {total} Einträgen',
          items: '{min}–{max} Einträge',
          pageRange: 'von {total} Seiten',
          page: 'Seite {page}',
          pageUnknown: 'Seite',
        },
        emptyState: {
          title: 'Keine Daten verfügbar',
          subtitle: 'Versuchen Sie, Ihre Filter anzupassen',
        },
        filterPanel: {
          title: 'Filter',
          close: 'Schließen',
          advancedFilters: 'Erweiterte Filter',
          searchLabel: 'Filter suchen',
          searchPlaceholder: 'Suchen...',
          clearSearchTooltip: 'Suche löschen',
          apply: 'Anwenden',
          clear: 'Löschen',
          noFilters: 'Keine Filter verfügbar',
          fieldFallback: 'Feld',
          fieldPlaceholder: 'Auswählen...',
          fieldNoMatch: 'Keine Übereinstimmungen gefunden',
          fieldNoOptions: 'Keine Optionen verfügbar',
          dropdownLabel: 'Wert auswählen',
          multiSelectLabel: 'Werte auswählen',
          dateRangeEndLabel: 'Enddatum',
          numberInvalidError: 'Ungültige Nummer',
          sliderNoValues: 'Keine Werte verfügbar',
        },
        columnCustomization: {
          title: 'Spalten anpassen',
          description: 'Spalten zum Anzeigen auswählen',
          searchPlaceholder: 'Spalten suchen...',
          selectAll: 'Alle auswählen',
          apply: 'Anwenden',
          cancel: 'Abbrechen',
        },
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
