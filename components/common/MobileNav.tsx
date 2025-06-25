import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface NavItem {
  icon: string;
  label: string;
  value: string;
  badge?: number | string;
}

interface MobileNavProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (value: string) => void;
  position?: 'top' | 'bottom';
}

const MobileNav: React.FC<MobileNavProps> = ({
  items,
  activeItem,
  onItemClick,
  position = 'bottom'
}) => {
  const { isMobile } = useResponsive();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isMobile) {
    // Desktop navigation
    return (
      <nav className="flex space-x-1 bg-bg-card rounded-lg p-1 shadow-sm">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => onItemClick(item.value)}
            className={`
              flex items-center px-4 py-2 rounded-md font-medium text-sm transition-all
              ${activeItem === item.value
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <i className={`${item.icon} mr-2`}></i>
            <span>{item.label}</span>
            {item.badge && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    );
  }

  // Mobile navigation
  const navClasses = position === 'bottom'
    ? 'fixed bottom-0 left-0 right-0 z-40'
    : 'fixed top-0 left-0 right-0 z-40';

  return (
    <>
      {/* Spacer to prevent content overlap */}
      <div className={position === 'bottom' ? 'h-16' : 'h-16 mb-4'} />
      
      <nav className={`${navClasses} bg-bg-card border-t border-border-default shadow-lg`}>
        <div className="flex justify-around items-center h-16">
          {items.slice(0, 4).map((item) => (
            <button
              key={item.value}
              onClick={() => onItemClick(item.value)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full relative
                ${activeItem === item.value
                  ? 'text-teal-500'
                  : 'text-gray-600 dark:text-gray-400'
                }
              `}
            >
              <i className={`${item.icon} text-xl`}></i>
              <span className="text-xs mt-1">{item.label}</span>
              {item.badge && (
                <span className="absolute top-2 right-1/4 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white min-w-[18px]">
                  {item.badge}
                </span>
              )}
              {activeItem === item.value && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-teal-500"></div>
              )}
            </button>
          ))}
          
          {/* More button if there are more than 4 items */}
          {items.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-600 dark:text-gray-400"
            >
              <i className="fas fa-ellipsis-h text-xl"></i>
              <span className="text-xs mt-1">More</span>
            </button>
          )}
        </div>
        
        {/* Expanded menu */}
        {isExpanded && items.length > 4 && (
          <div className="absolute bottom-full left-0 right-0 bg-bg-card border-t border-border-default shadow-lg">
            <div className="grid grid-cols-4 gap-2 p-4">
              {items.slice(4).map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    onItemClick(item.value);
                    setIsExpanded(false);
                  }}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg
                    ${activeItem === item.value
                      ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-500'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <i className={`${item.icon} text-xl mb-1`}></i>
                  <span className="text-xs">{item.label}</span>
                  {item.badge && (
                    <span className="mt-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default MobileNav;