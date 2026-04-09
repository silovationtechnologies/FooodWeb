import React from 'react';

const OrderPopup = ({ order, onAccept, onDismiss, onUpdateItemQty, currentTime }) => {
    if (!order) return null;

    const getDuration = (createdAt) => {
        const start = new Date(createdAt).getTime();
        const diff = Math.max(0, (currentTime || Date.now()) - start);
        const secs = Math.floor(diff / 1000);
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getDurationColor = (createdAt) => {
        const diff = (currentTime || Date.now()) - new Date(createdAt).getTime();
        const mins = diff / 60000;
        if (mins > 45) return 'timer-red';
        if (mins > 30) return 'timer-orange';
        if (mins > 15) return 'timer-yellow';
        return 'timer-green';
    };

    return (
        <div className="order-popup-overlay animate-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div className="order-popup glass animate-fade" style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                borderRadius: '24px',
                backgroundColor: 'var(--bg-surface)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px var(--border-subtle)'
            }}>
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🔔</span>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.02em', fontWeight: '800', margin: 0 }}>New Order Alert</h2>
                    </div>
                    <div className={getDurationColor(order.created_at)} style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '800', 
                        padding: '8px 16px', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        ⏱️ {getDuration(order.created_at)}
                    </div>
                </div>



                <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <span style={{ fontSize: '1.6rem', fontWeight: '900', letterSpacing: '-0.03em', color: 'var(--text-main)' }}>
                            {order.table_id === 0 ? `Parcel #${order.items.find(i => i.type === 'METADATA')?.takeaway_no || order.id}` : `Table ${order.table_id}`}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Received At</p>
                            <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: '800' }}>{new Date(order.created_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>


                    <div className="items-list" style={{ 
                        flex: 1, 
                        overflowY: 'auto', 
                        marginBottom: '32px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        paddingRight: '8px' 
                    }}>
                        {order.items
                            .filter(i => i.type !== 'METADATA')
                            .map((item, idx) => (
                                <div
                                    key={idx}
                                    className={item.isNew ? 'premium-border' : ''}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '1.05rem',
                                        color: 'var(--text-main)',
                                        border: item.isNew ? 'none' : '1px solid var(--border-subtle)',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        backgroundColor: 'var(--bg-surface)',
                                    }}
                                >
                                    <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                backgroundColor: 'var(--glass)',
                                                padding: '4px 8px',
                                                borderRadius: '10px',
                                                border: '1px solid var(--border-subtle)',
                                            }}
                                        >
                                            <button
                                                onClick={() =>
                                                    onUpdateItemQty &&
                                                    onUpdateItemQty(order.id, item.name, -1, item.isParcel)
                                                }
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--text-main)',
                                                    fontSize: '1.1rem',
                                                    cursor: 'pointer',
                                                    padding: '0 4px',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                −
                                            </button>
                                            <span
                                                style={{
                                                    color: 'var(--bg-dark)',
                                                    backgroundColor: 'var(--accent-white)',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '6px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700',
                                                }}
                                            >
                                                {item.qty}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    onUpdateItemQty &&
                                                    onUpdateItemQty(order.id, item.name, 1, item.isParcel)
                                                }
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--text-main)',
                                                    fontSize: '1.1rem',
                                                    cursor: 'pointer',
                                                    padding: '0 4px',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                                    </span>
                                    <span style={{ fontWeight: '600' }}>₹{item.price * item.qty}</span>
                                </div>
                            ))}
                    </div>

                    <div style={{
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px'
                    }}>
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Total</span>
                        <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>₹{order.total}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                            onClick={onDismiss}
                            style={{ flex: 1, padding: '16px', backgroundColor: 'var(--glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontWeight: '600', fontSize: '1rem', borderRadius: '16px' }}
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={() => onAccept(order.id, order.table_id)}
                            style={{ flex: 2, padding: '16px', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', fontWeight: '700', fontSize: '1rem', borderRadius: '16px' }}
                        >
                            Take Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPopup;
