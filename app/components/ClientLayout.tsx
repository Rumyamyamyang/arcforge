'use client';

import { ReactNode } from 'react';
import { LanguageProvider, translations, itemTranslations } from '../i18n';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <LanguageProvider translations={translations} itemTranslations={itemTranslations}>
      {children}
    </LanguageProvider>
  );
}
