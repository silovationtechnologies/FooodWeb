import React from 'react';
import Skeleton from './Skeleton';

const SkeletonMenuCard = () => {
  return (
    <div
      className="menu-item-card"
      style={{
        background: '#0a0a0c',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        padding: '18px',
        height: '100%'
      }}
    >
      {/* Image Section */}
      <div style={{
        height: '140px',
        marginTop: '-12px',
        marginLeft: '-16px',
        marginRight: '-16px',
        marginBottom: '16px',
        borderRadius: '12px 12px 0 0',
        overflow: 'hidden'
      }}>
        <Skeleton height="100%" borderRadius="0" />
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="70%" height="1.2rem" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Skeleton width="100%" height="0.8rem" />
          <Skeleton width="90%" height="0.8rem" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
          <Skeleton width="50px" height="1.5rem" />
          <Skeleton width="70px" height="2.2rem" borderRadius="20px" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonMenuCard;
