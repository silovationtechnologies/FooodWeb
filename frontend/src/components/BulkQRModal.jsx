import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const BulkQRModal = ({ tables, isOpen, onClose, qrBaseUrl }) => {
    if (!isOpen) return null;

    const printBulk = () => {
        window.print();
    };

    return (
        <div className="no-print" style={{ 
            position: 'fixed', inset: 0, zIndex: 5000, 
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', padding: '40px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div>
                    <h2 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>Bulk QR Printing</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Premium table cards optimized for bulk printing.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={printBulk} 
                        style={{ padding: '16px 32px', background: 'var(--accent-white)', color: 'var(--bg-dark)', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,255,255,0.2)' }}
                    >Print All Cards</button>
                    <button 
                        onClick={onClose} 
                        style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', borderRadius: '16px', fontWeight: '600', cursor: 'pointer' }}
                    >Close</button>
                </div>
            </div>

            <div id="bulk-qr-container" style={{ 
                flex: 1, overflowY: 'auto', 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '40px', padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' 
            }}>
                {tables.map(table => (
                    <div key={table.id} className="qr-print-card" style={{
                        width: '320px',
                        height: '480px',
                        backgroundColor: '#26817B',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: 'sans-serif',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        padding: '16px',
                        boxSizing: 'border-box'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            border: '2px solid #E3C565',
                            borderRadius: '6px',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '16px 12px',
                            justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <img src="/fooodweb-logo.jpeg" alt="logo" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #E3C565' }} />
                                <h2 style={{ 
                                    margin: 0, 
                                    color: '#E3C565', 
                                    fontFamily: 'serif', 
                                    fontSize: '1.6rem', 
                                    letterSpacing: '0.08em',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                    fontWeight: '800'
                                }}>FOOODWEB</h2>
                            </div>
                            
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                border: '4px solid #E3C565',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                                marginBottom: '8px',
                                width: '180px',
                                height: '180px',
                                justifyContent: 'center',
                                boxSizing: 'content-box'
                            }}>
                                <QRCodeSVG
                                    value={`${qrBaseUrl.startsWith('http') ? '' : window.location.protocol + '//'}${qrBaseUrl.replace(/\/$/, '')}/menu?table=${table.id}&tk=${table.isTakeaway ? '1' : '0'}`}
                                    size={150}
                                    style={{ width: '150px', height: '150px', marginBottom: '8px' }}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="H"
                                    includeMargin={false}
                                />
                                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#000', textAlign: 'center', fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>
                                    {table.id === 0 ? 'PARCEL' : `TABLE ${table.id}`}
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', width: '100%', marginBottom: '8px' }}>
                                <h3 style={{
                                    margin: '0 0 6px 0',
                                    color: '#E3C565',
                                    fontFamily: '"Brush Script MT", cursive',
                                    fontSize: '2rem',
                                    fontWeight: '500',
                                    textShadow: '1px 1px 3px rgba(0,0,0,0.3)',
                                    fontStyle: 'italic',
                                    lineHeight: 1
                                }}>Scan to Order</h3>
                                
                                <div style={{ width: '100px', height: '1.5px', backgroundColor: '#E3C565', margin: '0 auto 8px auto', opacity: 0.9 }}></div>
                                
                                <p style={{
                                    margin: '0',
                                    color: '#E3C565',
                                    fontFamily: 'serif',
                                    fontSize: '1rem',
                                    letterSpacing: '0.05em',
                                    fontWeight: '600'
                                }}>www.fooodweb.com</p>
                            </div>

                            <div style={{ textAlign: 'center', width: '100%' }}>
                                <p style={{ margin: '0 0 2px 0', color: '#E3C565', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em' }}>FOOODWEB</p>
                                <p style={{ margin: 0, color: '#E3C565', fontSize: '0.55rem', fontWeight: '800', letterSpacing: '0.05em', opacity: 0.9 }}>POWERED BY SILOVATION TECHNOLOGIES</p>
                            </div>
                        </div>
                        <button 
                            className="no-print"
                            onClick={() => {
                                const urlPrefix = qrBaseUrl.startsWith('http') ? qrBaseUrl : `${window.location.protocol}//${qrBaseUrl}`;
                                window.open(`${urlPrefix.replace(/\/$/, '')}/menu?table=${table.id}&tk=${table.isTakeaway ? '1' : '0'}`, '_blank');
                            }}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                padding: '8px 16px',
                                backgroundColor: 'rgba(255,255,255,0.9)',
                                border: 'none',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#26817B',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                zIndex: 10,
                                whiteSpace: 'nowrap'
                            }}
                        >
                            🔗 Test Link
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; visibility: hidden !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; visibility: hidden !important; }
                    #bulk-qr-container, #bulk-qr-container * { 
                        visibility: visible !important; 
                    }
                    #bulk-qr-container { 
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        display: flex !important;
                        flex-wrap: wrap !important;
                        justify-content: center !important;
                        gap: 10mm !important;
                    }
                    .qr-card-premium { 
                        page-break-inside: avoid !important;
                        margin: 0 !important;
                        width: 90mm !important;
                        height: 135mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        print-color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                        display: block !important;
                        position: relative !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default BulkQRModal;
