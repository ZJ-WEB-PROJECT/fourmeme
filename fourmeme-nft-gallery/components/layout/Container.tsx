import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <>
      <div
        className={`app-container ${className}`}
        style={{ maxWidth: 1240, margin: '0 auto', padding: '0 48px', width: '100%' }}
      >
        {children}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .app-container { padding: 0 16px !important; }
        }
      `}</style>
    </>
  );
}
