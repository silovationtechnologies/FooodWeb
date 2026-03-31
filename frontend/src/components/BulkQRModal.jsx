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
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '40px', padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' 
            }}>
                {tables.map(table => (
                    <div key={table.id} className="qr-card-premium" style={{
                        position: 'relative',
                        width: '100%',
                        paddingBottom: '150%', // Enforce 2:3 aspect ratio without overlap
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        backgroundColor: 'var(--bg-dark)',
                        background: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)',
                        fontSize: '16px' // Base font size
                    }}>
                        <div className="qr-card-content" style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            justifyContent: 'space-between', padding: '13% 10%', boxSizing: 'border-box'
                        }}>
                            {/* Inner Gold Border */}
                            <div style={{
                                position: 'absolute', top: '4%', right: '4%', bottom: '4%', left: '4%',
                                border: '3px solid var(--primary)', pointerEvents: 'none', zIndex: 0
                            }} />

                            {/* Noise / Texture Overlay */}
                            <div style={{
                                position: 'absolute', inset: 0, zIndex: 0, opacity: 0.1,
                                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'
                            }} />

                            <h1 style={{
                                color: 'var(--primary)', fontFamily: '"Times New Roman", Times, serif',
                                fontSize: '180%', fontWeight: 'bold', letterSpacing: '2px',
                                margin: '0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                                zIndex: 1, textAlign: 'center'
                            }}>FOOOD WEB</h1>

                            <div style={{
                                width: '58%', aspectRatio: '1', backgroundColor: '#ffffff',
                                borderRadius: '16px', border: '4px solid var(--primary)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.4)', zIndex: 1,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                padding: '5%', boxSizing: 'border-box'
                            }}>
                                <QRCodeSVG
                                    value={`${qrBaseUrl.replace(/\/$/, '')}/menu?table=${table.id}`}
                                    size={256}
                                    style={{ width: '100%', height: 'calc(100% - 14px)' }}
                                    level="H" fgColor="#000000" includeMargin={false}
                                />
                                <div style={{ fontSize: '75%', fontWeight: '900', color: '#000', marginTop: '4%', textAlign: 'center', fontFamily: 'sans-serif' }}>
                                    {table.id === 0 ? 'PARCEL' : `TABLE ${table.id}`}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '8px', zIndex: 1 }}>
                                <div style={{
                                    color: 'var(--primary)', fontFamily: '"Brush Script MT", "Great Vibes", cursive',
                                    fontSize: '200%', textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                    textAlign: 'center', fontStyle: 'italic'
                                }}>Scan to Order</div>

                                <div style={{ width: '70%', height: '1.5px', backgroundColor: 'var(--primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }} />

                                <div style={{
                                    color: 'var(--primary)', fontFamily: '"Times New Roman", Times, serif',
                                    fontSize: '110%', letterSpacing: '1px', textAlign: 'center'
                                }}>www.fooodweb.com</div>
                            </div>

                            <div style={{
                                color: 'var(--primary)', fontFamily: 'sans-serif',
                                fontSize: '60%', letterSpacing: '0.08em', zIndex: 1,
                                textAlign: 'center', fontWeight: 'bold', lineHeight: '1.4'
                            }}>
                                <div>FOOOD WEB</div>
                                <div style={{ opacity: 0.9 }}>POWERED BY SILOVATION TECHNOLOGIES</div>
                            </div>
                        </div>
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
