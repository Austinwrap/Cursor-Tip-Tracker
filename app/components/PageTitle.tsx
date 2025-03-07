import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2 text-white">{title}</h1>
      {subtitle && <p className="text-gray-400">{subtitle}</p>}
    </div>
  );
};

export default PageTitle; 