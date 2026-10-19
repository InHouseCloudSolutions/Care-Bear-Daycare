'use client';

import { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

const SiteDocumentsContext = createContext([]);

const siteDocumentShape = PropTypes.shape({
  slug: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  fileUrl: PropTypes.string,
  downloadFilename: PropTypes.string,
  showInFooter: PropTypes.bool,
  sortOrder: PropTypes.number,
});

export function SiteDocumentsProvider({ siteDocuments, children }) {
  const value = useMemo(() => siteDocuments ?? [], [siteDocuments]);
  return <SiteDocumentsContext.Provider value={value}>{children}</SiteDocumentsContext.Provider>;
}

SiteDocumentsProvider.propTypes = {
  siteDocuments: PropTypes.arrayOf(siteDocumentShape),
  children: PropTypes.node.isRequired,
};

export function useSiteDocuments() {
  return useContext(SiteDocumentsContext);
}
