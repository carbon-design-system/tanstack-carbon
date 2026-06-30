import { useEffect } from 'react';

/**
 * Custom hook to close overflow menu when scrolling occurs
 * Waits for .cds--data-table-content element to exist before adding listener
 */
const useMenuCloseOnScroll = (tableRef) => {
  useEffect(() => {
    let tblContainer = null;

    const handleScroll = () => {
      const openMenu = document.querySelector('button.cds--overflow-menu--open');
      if (openMenu && tblContainer) {
        tblContainer.click();
      }
    };

    const observer = new MutationObserver(() => {
      const targetDiv = tableRef.current;

      if (targetDiv) {
        tblContainer = targetDiv.querySelector('.cds--data-table-content');
        if (tblContainer) {
          tblContainer.addEventListener('scroll', handleScroll);
        }

        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      if (tblContainer) {
        tblContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [tableRef]);
};

export default useMenuCloseOnScroll;
