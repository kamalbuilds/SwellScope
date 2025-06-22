import React, { useState } from 'react';
import { RiskAlert, ComponentProps } from '../types';

interface AlertPanelProps extends ComponentProps {
  alerts: RiskAlert[];
  onDismiss?: (alertId: string) => void;
  onMarkAsRead?: (alertId: string) => void;
  maxVisible?: number;
}

const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  onDismiss,
  onMarkAsRead,
  maxVisible = 3,
  className = '',
}) => {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const toggleExpanded = (alertId: string) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertId)) {
      newExpanded.delete(alertId);
    } else {
      newExpanded.add(alertId);
    }
    setExpandedAlerts(newExpanded);
  };

  const getSeverityColor = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-500/10 text-red-300';
      case 'high':
        return 'border-orange-500 bg-orange-500/10 text-orange-300';
      case 'medium':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-300';
      case 'low':
        return 'border-blue-500 bg-blue-500/10 text-blue-300';
      default:
        return 'border-gray-500 bg-gray-500/10 text-gray-300';
    }
  };

  const getSeverityIcon = (severity: RiskAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getTypeIcon = (type: RiskAlert['type']) => {
    switch (type) {
      case 'critical':
        return '💀';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Filter and sort alerts
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.isRead);
  const otherAlerts = alerts.filter(alert => alert.severity !== 'critical').slice(0, maxVisible);
  const visibleAlerts = [...criticalAlerts, ...otherAlerts];

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 transition-all duration-200 ${getSeverityColor(alert.severity)} ${
            !alert.isRead ? 'ring-1 ring-current/20' : 'opacity-75'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 text-xl">
                {getSeverityIcon(alert.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-white truncate">
                    {alert.title}
                  </h3>
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-current rounded-full flex-shrink-0" />
                  )}
                </div>
                
                <p className={`text-sm ${expandedAlerts.has(alert.id) ? '' : 'line-clamp-2'}`}>
                  {alert.message}
                </p>
                
                {alert.message.length > 100 && (
                  <button
                    onClick={() => toggleExpanded(alert.id)}
                    className="text-xs text-current hover:underline mt-1"
                  >
                    {expandedAlerts.has(alert.id) ? 'Show less' : 'Show more'}
                  </button>
                )}
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="capitalize">{alert.category.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{formatTimestamp(alert.timestamp)}</span>
                    {alert.actionRequired && (
                      <>
                        <span>•</span>
                        <span className="text-orange-300 font-medium">Action Required</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!alert.isRead && onMarkAsRead && (
                      <button
                        onClick={() => onMarkAsRead(alert.id)}
                        className="text-xs px-2 py-1 rounded bg-current/20 hover:bg-current/30 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                    
                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.id)}
                        className="text-xs px-2 py-1 rounded bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 transition-colors"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
                
                {alert.relatedAssets.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/20">
                    <p className="text-xs text-current/80">
                      Related assets: {alert.relatedAssets.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {alerts.length > maxVisible && (
        <div className="text-center">
          <button className="text-sm text-gray-400 hover:text-white transition-colors">
            View all {alerts.length} alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertPanel; 