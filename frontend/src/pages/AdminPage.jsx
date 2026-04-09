import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import OrderPopup from '../components/OrderPopup';
import InvoiceModal from '../components/InvoiceModal';
import InventoryManager from '../components/InventoryManager';
import BulkQRModal from '../components/BulkQRModal';
import { QRCodeSVG } from 'qrcode.react';

const AdminPage = () => {
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('floor'); // 'floor' | 'queue' | 'takeaway' | 'customize'
    const [newOrder, setNewOrder] = useState(null);
    const [notifiedOrderTotals, setNotifiedOrderTotals] = useState({});
    const [selectedTableOrder, setSelectedTableOrder] = useState(null);
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrTable, setQrTable] = useState(null);
    const [qrBaseUrl, setQrBaseUrl] = useState(window.location.host);
    const [mappingItem, setMappingItem] = useState(null);
    const [showBulkQR, setShowBulkQR] = useState(false);
    const [categories, setCategories] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [showManualOrder, setShowManualOrder] = useState(null); // tableId
    const [editItem, setEditItem] = useState(null);
    const [editCategory, setEditCategory] = useState(null);
    const [menuSearch, setMenuSearch] = useState('');
    const [manualCart, setManualCart] = useState([]);
    const [manualSearch, setManualSearch] = useState('');
    const [manualCategory, setManualCategory] = useState('all');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [addItemSearch, setAddItemSearch] = useState('');
    const [isAddNewAsParcel, setIsAddNewAsParcel] = useState(false);
    const [customerContacts, setCustomerContacts] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [payPhone, setPayPhone] = useState('');
    const [payName, setPayName] = useState('');
    const [payExists, setPayExists] = useState(false);
    const [handoverOrderId, setHandoverOrderId] = useState(null);
    const [showTransferModal, setShowTransferModal] = useState(null);
    const [showCombineModal, setShowCombineModal] = useState(null);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'dine-in' | 'parcel'
    const [showOrderCustomize, setShowOrderCustomize] = useState(false);
    const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);



    
    // Split Payment & Manual Edit States
    const [editTotal, setEditTotal] = useState(0);
    const [isSplitPayment, setIsSplitPayment] = useState(false);
    const [splitCashAmount, setSplitCashAmount] = useState(0);
    const [splitOnlineAmount, setSplitOnlineAmount] = useState(0);
    
    // Security Utility: Sanitize inputs to prevent XSS
    const sanitize = (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[<>]/g, '').trim();
    };
    
    // Recipe Modal State
    const [newMatId, setNewMatId] = useState('');
    const [newMatQty, setNewMatQty] = useState('');
    
    const detectedIp = "10.18.40.43";

    // --- Inventory State (Lifted) ---
    const [materials, setMaterials] = useState(() => {
        const saved = localStorage.getItem('inv_materials');
        return saved ? JSON.parse(saved) : [];
    });
    const [invRecipes, setInvRecipes] = useState(() => {
        const saved = localStorage.getItem('inv_recipes');
        return saved ? JSON.parse(saved) : [];
    });
    const [consumeLog, setConsumeLog] = useState(() => {
        const saved = localStorage.getItem('inv_consume_log');
        return saved ? JSON.parse(saved) : [];
    });
    const [restockLog, setRestockLog] = useState(() => {
        const saved = localStorage.getItem('inv_restock_log');
        return saved ? JSON.parse(saved) : [];
    });
    const [deductedOrders, setDeductedOrders] = useState(() => {
        const saved = localStorage.getItem('inv_deducted_orders');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Persistence Sync ---
    useEffect(() => {
        localStorage.setItem('inv_materials', JSON.stringify(materials));
        localStorage.setItem('inv_recipes', JSON.stringify(invRecipes));
        localStorage.setItem('inv_consume_log', JSON.stringify(consumeLog));
        localStorage.setItem('inv_restock_log', JSON.stringify(restockLog));
        localStorage.setItem('inv_deducted_orders', JSON.stringify(deductedOrders));
    }, [materials, invRecipes, consumeLog, restockLog, deductedOrders]);

    const fetchMenuItems = async () => {
        const { data } = await supabase.from('menu_items').select('*');
        if (data) {
            setMenuItems(data);
        }
    };

    const fetchTables = async () => {
        const { data } = await supabase.from('tables').select('*').order('id');
        if (data) {
            setTables(data);
        }
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('*').order('name');
        if (data) {
            setCategories(data);
        }
    };

    const fetchCustomers = async () => {
        const { data } = await supabase.from('customers').select('*').order('name');
        if (data) {
            setCustomerContacts(data);
        }
    };

    const checkCustomerByPhone = async (phone) => {
        if (phone.length === 10) {
            const { data } = await supabase.from('customers').select('*').eq('phone_number', phone).single();
            if (data) {
                setPayName(data.name);
                setPayExists(true);
            } else {
                setPayExists(false);
            }
        } else {
            setPayExists(false);
        }
    };

    const fetchOrders = async () => {
        const { data } = await supabase.from('orders')
            .select('*')
            .order('id', { ascending: true }); // Fetching all (active + paid) for stats

        if (data) {
            setOrders(data);
        }
    };

    const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchTables(), fetchOrders(), fetchMenuItems(), fetchCategories(), fetchCustomers()]);
        setLoading(false);
    };

    useEffect(() => {
        fetchInitialData();

        const pollInterval = setInterval(() => {
            fetchTables();
            fetchOrders();
        }, 5000); // Increased to 5s to enhance speed, real-time handles instant updates

        const timeInterval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000); // Updated to 1s for live feel

        const channel = supabase
            .channel('admin-ops')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => {
                fetchTables();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => {
                fetchCustomers();
            })
            .subscribe();

        return () => {
            clearInterval(pollInterval);
            clearInterval(timeInterval);
            supabase.removeChannel(channel);
        };
    }, []);

    // Audio Context Ref to persist across renders
    const audioContextRef = useRef(null);

    // Initialize/Resume AudioContext on first user gesture
    useEffect(() => {
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            // We don't remove listener yet, as we might need to resume again 
            // if it suspends (though usually once is enough)
        };
        document.addEventListener('click', initAudio);
        return () => document.removeEventListener('click', initAudio);
    }, []);

    // Function to play high-frequency chime via Web Audio API (Reliable)
    const playOrderBeep = () => {
        try {
            if (!audioContextRef.current) return;
            
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1400, ctx.currentTime); // High pitch frequency
            
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch (err) {
            console.log('Audio failed:', err);
        }
    };

    const getDuration = (createdAt) => {
        if (!createdAt) return '00:00:00';
        const start = new Date(createdAt).getTime();
        const diff = Math.max(0, currentTime - start);
        const secsTotal = Math.floor(diff / 1000);
        const hrs = Math.floor(secsTotal / 3600);
        const mins = Math.floor((secsTotal % 3600) / 60);
        const secs = secsTotal % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    const getDurationColor = (createdAt) => {
        if (!createdAt) return 'var(--text-muted)';
        const start = new Date(createdAt).getTime();
        const mins = Math.floor((currentTime - start) / 60000);
        if (mins < 15) return '#4ade80'; // Green
        if (mins < 30) return '#fbbf24'; // Amber
        return '#f87171'; // Red
    };


    useEffect(() => {
        if (!newOrder && orders.length > 0) {
            const unseen = orders.find(o => o.status === 'new' && notifiedOrderTotals[o.id] !== o.total);
            if (unseen) {
                setNewOrder(unseen);
                setNotifiedOrderTotals(prev => ({ ...prev, [unseen.id]: unseen.total }));
            }
        }
    }, [orders, newOrder, notifiedOrderTotals]);

    // Sync editTotal when selectedTableOrder changes
    useEffect(() => {
        if (selectedTableOrder) {
            setEditTotal(selectedTableOrder.total);
        }
    }, [selectedTableOrder?.total, selectedTableOrder?.id]);

    // Keep active modal in sync with realtime order updates
    useEffect(() => {
        if (selectedTableOrder) {
            const current = orders.find(o => o.id === selectedTableOrder.id);
            if (current && JSON.stringify(current) !== JSON.stringify(selectedTableOrder)) {
                setSelectedTableOrder(current);
            }
        }
    }, [orders]);

    // Handle looping beep for new orders
    useEffect(() => {
        let interval;
        if (newOrder) {
            // Play initial beep
            playOrderBeep();
            
            // Start looping interval
            interval = setInterval(() => {
                playOrderBeep();
            }, 300); // Beep every 0.3 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [newOrder]);

    // --- Automated Stock Deduction ---
    useEffect(() => {
        const ordersToDeduct = orders.filter(o => 
            (o.status === 'preparing' || o.status === 'ready' || o.status === 'paid') && 
            !deductedOrders.includes(o.id)
        );

        if (ordersToDeduct.length > 0) {
            let updatedMaterials = [...materials];
            let newLogs = [];
            let newDeductedIds = [...deductedOrders];

            ordersToDeduct.forEach(order => {
                order.items.forEach(item => {
                    // Normalize item name for matching
                    const recipe = invRecipes.find(r => r.menuItemId === item.id || r.name === item.name);
                    if (recipe) {
                        const qty = item.quantity || 1;
                        recipe.recipe.forEach(ing => {
                            const matIdx = updatedMaterials.findIndex(m => m.id === ing.materialId);
                            if (matIdx !== -1) {
                                updatedMaterials[matIdx] = {
                                    ...updatedMaterials[matIdx],
                                    stock: updatedMaterials[matIdx].stock - (ing.qty * qty)
                                };
                            }
                        });
                        newLogs.push({
                            id: Math.random().toString(36).substr(2, 9),
                            time: Date.now(),
                            recipeName: order.table_id === 0 ? `TK-${order.id} (${item.name})` : `Table ${order.table_id} (${item.name})`,
                            qty: qty,
                            deducted: recipe.recipe.map(ing => {
                                const m = materials.find(mat => mat.id === ing.materialId);
                                return { name: m?.name || 'Unknown', unit: m?.unit || '', qty: ing.qty * qty };
                            })
                        });
                    }
                });
                newDeductedIds.push(order.id);
            });

            if (newLogs.length > 0) {
                setMaterials(updatedMaterials);
                setConsumeLog(prev => [...newLogs, ...prev]);
                setDeductedOrders(newDeductedIds);
            } else {
                // Mark as processed even if no recipe matches
                setDeductedOrders(newDeductedIds);
            }
        }
    }, [orders, materials, invRecipes, deductedOrders]);

    const handleImageUpload = async (file) => {
        if (!file) return null;
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('menu-images')
                .upload(filePath, file);

            if (uploadError) {
                if (uploadError.message === 'Bucket not found') {
                    throw new Error('Storage bucket "menu-images" not found. Please create it in your Supabase dashboard.');
                }
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('menu-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Upload error details:', error);
            alert('Upload failed: ' + error.message);
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const placeManualOrder = async (tableId, items) => {
        try {
            let orderToUpdate = null;
            
            // Only merge for actual tables (not takeaway ID 0)
            if (tableId > 0) {
                const { data } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('table_id', tableId)
                    .neq('status', 'paid')
                    .neq('status', 'rejected');
                
                if (data && data.length > 0) {
                    orderToUpdate = data[0]; // Take the first active order for this table
                }
            }

            if (orderToUpdate) {
                // Merge with existing
                const updatedItems = [...orderToUpdate.items];
                items.forEach(newItem => {
                    // Match by ID AND the isParcel flag
                    const idx = updatedItems.findIndex(i => i.id === newItem.id && !!i.isParcel === !!newItem.isParcel);
                    if (idx > -1) updatedItems[idx].qty += newItem.qty;
                    else updatedItems.push({ ...newItem, isNew: false, qty: newItem.qty });
                });
                const newTotal = orderToUpdate.total + items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
                
                await supabase.from('orders').update({
                    items: updatedItems,
                    total: newTotal,
                    status: 'preparing'
                }).eq('id', orderToUpdate.id);
            } else {
                // New Order (New takeaway or new table)
                const total = items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
                const orderData = {
                    table_id: tableId,
                    items: items.map(i => ({ ...i, isNew: false })),
                    total,
                    status: 'preparing'
                };

                // Add takeaway metadata if Table 0
                if (tableId === 0) {
                    const takeawayNo = Math.floor(Math.random() * 9000) + 1000;
                    orderData.items.push({ type: 'METADATA', takeaway_no: takeawayNo });
                }

                await supabase.from('orders').insert(orderData);
            }
            
            if (tableId > 0) {
                await supabase.from('tables').update({ is_free: false }).eq('id', tableId);
            }
            
            fetchInitialData();
            setShowManualOrder(null);
            setManualCart([]);
            alert('Order placed successfully!');
        } catch (err) {
            console.error('Manual order error:', err);
            alert('Failed to place manual order: ' + err.message);
        }
    };

    const startNewDay = () => {
        const confirmClear = confirm("Are you sure you want to START A NEW DAY? This will reset the dashboard stats but KEEP all revenue data in history.");
        if (!confirmClear) return;

        try {
            // Soft reset: Update the reset timestamp used by the dashboard
            const now = new Date().toISOString();
            localStorage.setItem('dash_last_reset', now);

            // We still want to free tables for a fresh start
            supabase.from('tables').update({ is_free: true }).gt('id', -1).then(() => {
                alert("New day started! Tables have been reset and dashboard stats will show fresh data.");
                fetchInitialData();
            });
        } catch (err) {
            alert("Error starting new day: " + err.message);
        }
    };

    const rejectOrder = async (orderOrId) => {
        try {
            const passedOrder = typeof orderOrId === 'object' && orderOrId !== null ? orderOrId : null;
            const rawId = passedOrder ? passedOrder.id : orderOrId;
            const normalizedOrderId =
                typeof rawId === 'string' && rawId.trim() !== '' && !Number.isNaN(Number(rawId))
                    ? Number(rawId)
                    : rawId;

            // Try to find from local state, but fall back to passed order (from popup) if not yet in orders[]
            const targetOrder =
                orders.find(o => o.id === normalizedOrderId || o.id === rawId) || passedOrder;

            // Mark as rejected (so customer sees the rejection), but treat it as non-active everywhere else
            const { data: updatedOrder, error: updateError } = await supabase
                .from('orders')
                .update({ status: 'rejected' })
                .eq('id', normalizedOrderId)
                .select()
                .single();

            if (updateError) throw updateError;

            // If this was a dine-in table, immediately free it up
            const tableIdToFree = (updatedOrder && updatedOrder.table_id) ?? targetOrder?.table_id;
            if (tableIdToFree && Number(tableIdToFree) > 0) {
                const normalizedTableId =
                    typeof tableIdToFree === 'string' && !Number.isNaN(Number(tableIdToFree))
                        ? Number(tableIdToFree)
                        : tableIdToFree;

                await supabase
                    .from('tables')
                    .update({ is_free: true })
                    .eq('id', normalizedTableId);

                setTables(prev =>
                    prev.map(t =>
                        t.id === normalizedTableId ? { ...t, is_free: true } : t
                    )
                );

                if (selectedTableOrder && (selectedTableOrder.id === normalizedOrderId || selectedTableOrder.id === rawId)) {
                    setSelectedTableOrder(null);
                }
            }

            // Update local state so UI immediately reflects dismissal and status
            setOrders(prev => prev.map(o => (o.id === normalizedOrderId || o.id === rawId ? updatedOrder : o)));
            setNewOrder(null);
        } catch (err) {
            console.error('Error rejecting order:', err.message);
            alert('Failed to dismiss order: ' + err.message);
        }
    };

    const acceptOrder = async (orderId, tableId) => {
        try {
            const targetOrder = orders.find(o => o.id === orderId);
            if (!targetOrder) throw new Error('Order not found');

            const clearedItems = targetOrder.items.map(i => ({ ...i, isNew: false }));

            setTables(prev => prev.map(t => t.id === tableId ? { ...t, is_free: false } : t));
            
            if (selectedTableOrder && selectedTableOrder.id === orderId) {
                setSelectedTableOrder(prev => ({ ...prev, status: 'preparing', items: clearedItems }));
            }

            await supabase.from('tables').update({ is_free: false }).eq('id', tableId);

            const { data: updatedOrder, error: orderError } = await supabase
                .from('orders')
                .update({ 
                    status: 'preparing',
                    items: clearedItems
                })
                .eq('id', orderId)
                .select()
                .single();

            if (orderError) throw orderError;

            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
            if (selectedTableOrder && selectedTableOrder.id === orderId) {
                setSelectedTableOrder(updatedOrder);
            }

            setNewOrder(null);
        } catch (err) {
            console.error('Error taking order:', err.message);
            alert('Failed to take order: ' + err.message);
            fetchInitialData();
        }
    };

    const handleUpdateItemQty = async (orderId, itemName, delta, isParcelFlag = null) => {
        try {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            let newItems = [...order.items];
            const itemIdx = newItems.findIndex(
                i =>
                    i.name === itemName &&
                    !!i.isParcel === !!isParcelFlag &&
                    i.type !== 'METADATA'
            );
            
            if (itemIdx === -1) return;

            const updatedQty = newItems[itemIdx].qty + delta;
            
            if (updatedQty <= 0) {
                // Remove item
                newItems.splice(itemIdx, 1);
            } else {
                // Update qty
                newItems[itemIdx] = { ...newItems[itemIdx], qty: updatedQty };
            }

            // Recalculate total (excluding metadata)
            const newTotal = newItems
                .filter(i => i.type !== 'METADATA' && i.type !== 'PAYMENT_METADATA')
                .reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

            const { data: updatedOrder, error } = await supabase
                .from('orders')
                .update({ items: newItems, total: newTotal })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;

            setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
            if (newOrder && newOrder.id === orderId) {
                setNewOrder(updatedOrder); // Keep popup UI in sync
            }
            if (selectedTableOrder && selectedTableOrder.id === orderId) {
                setSelectedTableOrder(updatedOrder);
            }
        } catch (err) {
            console.error('Error updating quantity:', err.message);
        }
    };

    const markTableFree = async (rawTableId, paymentMethod = null, splitInfo = null) => {
        const tableId = Number(rawTableId);
        if (!tableId) return;
        try {
            // Find active order for this table
            const activeOrder = orders.find(o => Number(o.table_id) === tableId && o.status !== 'paid' && o.status !== 'rejected');
            
            if (activeOrder) {
                const updates = { status: 'paid' };

                // Handle PAYMENT_METADATA for breakdown
                let newItems = [...(activeOrder.items || [])];
                const metaIdx = newItems.findIndex(i => i.type === 'PAYMENT_METADATA');
                
                const metaPayload = { 
                    type: 'PAYMENT_METADATA', 
                    method: paymentMethod || 'Cash',
                    split: paymentMethod === 'Split' ? splitInfo : null 
                };

                if (metaIdx > -1) newItems[metaIdx] = metaPayload;
                else newItems.push(metaPayload);
                updates.items = newItems;

                const { error: updateError } = await supabase.from('orders').update(updates).eq('id', activeOrder.id);
                if (updateError) throw updateError;
            }

            // Free the primary table
            const { error: tableError } = await supabase.from('tables').update({ is_free: true }).eq('id', tableId);
            if (tableError) throw tableError;

            // Free any linked tables
            const linkedOrders = orders.filter(o => o.items?.length === 1 && o.items[0].type === 'LINK' && Number(o.items[0].targetTable) === tableId);
            for (const linked of linkedOrders) {
                await supabase.from('tables').update({ is_free: true }).eq('id', linked.table_id);
                await supabase.from('orders').update({ status: 'paid' }).eq('id', linked.id);
            }

            // Save/Update Customer Info if provided
            if (payPhone && payName) {
                await supabase.from('customers').upsert({ name: payName, phone_number: payPhone }, { onConflict: 'phone_number' });
                setPayPhone(''); setPayName(''); setPayExists(false);
            }

            // Local state updates
            setTables(prev => prev.map(t => Number(t.id) === tableId || linkedOrders.some(lo => Number(lo.table_id) === Number(t.id)) ? { ...t, is_free: true } : t));
            setOrders(prev => prev.filter(o => (Number(o.table_id) !== tableId && !linkedOrders.some(lo => lo.id === o.id)) || o.status === 'paid'));

            setSelectedTableOrder(null);
            setIsSplitPayment(false);
            fetchInitialData();
        } catch (err) {
            console.error('Error clearing table:', err.message);
            alert('Payment failed: ' + err.message);
        }
    };

    const completeTakeaway = async (orderId, paymentMethod, splitInfo = null) => {
        try {
            const updates = { status: 'paid' };

            // Handle metadata for breakdown
            const { data: orderToFix } = await supabase.from('orders').select('items').eq('id', orderId).maybeSingle();
            if (orderToFix) {
                let newItems = [...(orderToFix.items || [])];
                const metaIdx = newItems.findIndex(i => i.type === 'PAYMENT_METADATA');
                const metaPayload = { 
                    type: 'PAYMENT_METADATA', 
                    method: paymentMethod,
                    split: paymentMethod === 'Split' ? splitInfo : null
                };
                if (metaIdx > -1) newItems[metaIdx] = metaPayload;
                else newItems.push(metaPayload);
                updates.items = newItems;
            }

            const { error } = await supabase.from('orders')
                .update(updates)
                .eq('id', orderId);
            
            if (error) throw error;

            setOrders(prev => prev.filter(o => o.id !== orderId));
            alert('Parcel Handed Over Successfully!');
            fetchInitialData();
        } catch (err) {
            console.error('Error completing takeaway:', err.message);
            alert('Failed to complete takeaway: ' + err.message);
        }
    };

    const handleOrderPaid = async (orderId, method) => {
        try {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;

            const existingMeta = order.items.find(i => i.type === 'PAYMENT_METADATA');
            let newItems = [...order.items];
            
            if (existingMeta) {
                newItems = newItems.map(i => i.type === 'PAYMENT_METADATA' ? { ...i, method } : i);
            } else {
                newItems.push({ type: 'PAYMENT_METADATA', method });
            }

            const { error } = await supabase.from('orders')
                .update({ items: newItems, status: 'paid' })
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders();
            setInvoiceOrder(null);
        } catch (err) {
            console.error('Error recording payment:', err.message);
        }
    };

    const transferOrderToTable = async (orderId, fromTableId, toTableId) => {
        if (!toTableId || toTableId === fromTableId) return;

        try {
            const { data: existingTarget, error: targetError } = await supabase
                .from('orders')
                .select('*')
                .eq('table_id', toTableId)
                .neq('status', 'paid')
                .neq('status', 'rejected')
                .maybeSingle();

            if (targetError && targetError.code !== 'PGRST116') throw targetError;
            if (existingTarget) {
                alert('Target table already has an active order. Use "Combine Tables" instead.');
                return;
            }

            const { data: updatedOrder, error: orderError } = await supabase
                .from('orders')
                .update({ table_id: toTableId })
                .eq('id', orderId)
                .select()
                .single();

            if (orderError) throw orderError;

            await supabase.from('tables').update({ is_free: true }).eq('id', fromTableId);
            await supabase.from('tables').update({ is_free: false }).eq('id', toTableId);

            setTables(prev =>
                prev.map(t =>
                    t.id === fromTableId
                        ? { ...t, is_free: true }
                        : t.id === toTableId
                        ? { ...t, is_free: false }
                        : t
                )
            );

            setOrders(prev => prev.map(o => (o.id === orderId ? updatedOrder : o)));
            if (selectedTableOrder && selectedTableOrder.id === orderId) {
                setSelectedTableOrder(updatedOrder);
            }
        } catch (err) {
            console.error('Error transferring table:', err.message);
            alert('Failed to transfer table: ' + err.message);
        }
    };

    const combineTableWith = async (primaryTableId, secondaryTableId) => {
        if (!secondaryTableId || secondaryTableId === primaryTableId) return;

        try {
            const { data: primaryOrders, error: primaryError } = await supabase
                .from('orders')
                .select('*')
                .eq('table_id', primaryTableId)
                .neq('status', 'paid')
                .neq('status', 'rejected');

            if (primaryError) throw primaryError;

            const { data: secondaryOrders, error: secondaryError } = await supabase
                .from('orders')
                .select('*')
                .eq('table_id', secondaryTableId)
                .neq('status', 'paid')
                .neq('status', 'rejected');

            if (secondaryError) throw secondaryError;

            if (!primaryOrders || primaryOrders.length === 0) {
                alert('Primary table must have an active order to combine into.');
                return;
            }

            const keepOrder = primaryOrders[0];
            const mergeOrder = secondaryOrders && secondaryOrders.length > 0 ? secondaryOrders[0] : null;

            let mergedItems = [...keepOrder.items];
            if (mergeOrder) {
                mergeOrder.items.forEach(item => {
                    if (item.type === 'METADATA' || item.type === 'PAYMENT_METADATA' || item.type === 'LINK') return;
                    const idx = mergedItems.findIndex(
                        i =>
                            i.id === item.id &&
                            !!i.isParcel === !!item.isParcel &&
                            i.type !== 'METADATA' &&
                            i.type !== 'PAYMENT_METADATA' &&
                            i.type !== 'LINK'
                    );
                    if (idx > -1) {
                        mergedItems[idx] = {
                            ...mergedItems[idx],
                            qty: (mergedItems[idx].qty || 0) + (item.qty || 0),
                        };
                    } else {
                        mergedItems.push(item);
                    }
                });
            }

            const mergedTotal = mergedItems
                .filter(i => i.type !== 'METADATA' && i.type !== 'PAYMENT_METADATA' && i.type !== 'LINK')
                .reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

            const { data: updatedKeep, error: updateError } = await supabase
                .from('orders')
                .update({ items: mergedItems, total: mergedTotal })
                .eq('id', keepOrder.id)
                .select()
                .single();

            if (updateError) throw updateError;

            if (mergeOrder) {
                const { error: updateLinkError } = await supabase
                    .from('orders')
                    .update({ items: [{ type: 'LINK', targetTable: primaryTableId }], total: 0 })
                    .eq('id', mergeOrder.id);
                if (updateLinkError) throw updateLinkError;
            } else {
                const { error: insertLinkError } = await supabase
                    .from('orders')
                    .insert({ 
                        table_id: secondaryTableId, 
                        items: [{ type: 'LINK', targetTable: primaryTableId }], 
                        total: 0, 
                        status: 'preparing' 
                    });
                if (insertLinkError) throw insertLinkError;
            }

            await supabase.from('tables').update({ is_free: false }).eq('id', secondaryTableId);
            await supabase.from('tables').update({ is_free: false }).eq('id', primaryTableId);

            setTables(prev =>
                prev.map(t =>
                    (t.id === secondaryTableId || t.id === primaryTableId)
                        ? { ...t, is_free: false }
                        : t
                )
            );

            fetchOrders(); // Refresh to get the LINK order

            if (selectedTableOrder && selectedTableOrder.table_id === primaryTableId) {
                setSelectedTableOrder(updatedKeep);
            }
        } catch (err) {
            console.error('Error combining tables:', err.message);
            alert('Failed to combine tables: ' + err.message);
        }
    };

    const handleTableClick = (table) => {
        const tableOrder = orders.find(
            o => o.table_id === table.id && o.status !== 'paid' && o.status !== 'rejected'
        );
        if (tableOrder) {
            setSelectedTableOrder(tableOrder);
            setEditTotal(tableOrder.total || 0);
            setIsSplitPayment(false);
            setSplitCashAmount(0);
            setSplitOnlineAmount(0);
            setPayPhone('');
            setPayName('');
            setPayExists(false);
        }
    };

    const getStats = () => {
        const lastReset = localStorage.getItem('dash_last_reset');
        const resetTime = lastReset ? new Date(lastReset).getTime() : 0;

        const occupiedTableIds = new Set(
            orders.filter(o => o.status !== 'paid' && o.status !== 'rejected').map(o => o.table_id)
        );
        const occupied = occupiedTableIds.size;
        const free = tables.length - occupied;
        
        // Active orders count (excluding LINK orders)
        const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'rejected' && !(o.items?.length === 1 && o.items[0].type === 'LINK')).length;

        // Revenue Breakdown (Filtered by Daily Reset)
        const paidOrders = orders.filter(o => o.status === 'paid' && new Date(o.updated_at || o.created_at).getTime() > resetTime);
        const revenue = paidOrders.reduce((acc, curr) => acc + curr.total, 0);
        
        const cashRevenue = paidOrders.reduce((acc, curr) => {
            const payMeta = curr.items?.find(i => i.type === 'PAYMENT_METADATA');
            const method = curr.payment_method || payMeta?.method || 'Cash';
            if (method === 'Cash') return acc + curr.total;
            if (method === 'Split' && payMeta?.split?.cash) return acc + payMeta.split.cash;
            return acc;
        }, 0);

        const onlineRevenue = paidOrders.reduce((acc, curr) => {
            const payMeta = curr.items?.find(i => i.type === 'PAYMENT_METADATA');
            const method = curr.payment_method || payMeta?.method;
            if (method === 'Online') return acc + curr.total;
            if (method === 'Split' && payMeta?.split?.online) return acc + payMeta.split.online;
            return acc;
        }, 0);

        return { free, occupied, activeOrders, revenue, cashRevenue, onlineRevenue };
    };


    const stats = getStats();

    return (
        <>
            <div className={`ldb-root admin-container`} style={{ minHeight: '100vh', background: 'var(--bg-dark)' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', color: 'var(--text-main)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1.1 }}>FooodWeb ADMIN</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: '500', marginTop: '4px' }}>Dashboard & Operations</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }} className="header-actions">
                        <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '14px',
                                    backgroundColor: 'var(--glass)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border-subtle)',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                📊 Dashboard
                            </button>
                            <button
                                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                style={{
                                    padding: '10px 16px',
                                    borderRadius: '14px',
                                    backgroundColor: 'var(--glass)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border-subtle)',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                ⚙️ Customize
                            </button>
                            {showSettingsMenu && (
                                <div className="glass animate-fade" style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    width: '220px',
                                    borderRadius: '20px',
                                    padding: '8px',
                                    zIndex: 5000,
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                    border: '1px solid var(--border-subtle)',
                                    backdropFilter: 'blur(20px)'
                                }}>
                                    {[
                                        { label: '✨ Start New Day', onClick: startNewDay, icon: '🌅', color: '#00C9A7' },
                                        { label: '⚙️ Management', onClick: () => setActiveTab('customize'), icon: '🛠️' },
                                        { label: '🚪 Sign Out', onClick: () => supabase.auth.signOut(), icon: '🔓', color: '#f87171' }
                                    ].map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => { item.onClick(); setShowSettingsMenu(false); }}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '14px 16px',
                                                borderRadius: '12px',
                                                backgroundColor: 'transparent',
                                                color: item.color || 'var(--text-main)',
                                                border: 'none',
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span> {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </header>

                {/* Stats Bar */}
                <style>
                    {`
                        @media (max-width: 768px) {
                            .desktop-only { display: none !important; }
                            .mobile-only { display: block !important; }
                            .header-actions { width: auto; gap: 6px !important; }
                            .stats-grid { 
                                grid-template-columns: repeat(2, 1fr) !important; 
                                gap: 10px !important;
                                margin-bottom: 20px !important;
                            }
                            .admin-container { padding: 16px 12px !important; }
                            .table-grid { grid-template-columns: 1fr !important; }
                            .modal-content { 
                                width: 95% !important; 
                                padding: 20px !important; 
                                max-height: 90vh !important;
                                overflow-y: auto !important;
                            }
                        }
                        @media (min-width: 769px) {
                            .mobile-only { display: none !important; }
                        }
                    `}
                </style>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: '12px',
                    marginBottom: '28px'
                }} className="stats-grid">
                    {[
                        { label: 'Occupied',  val: stats.occupied,      icon: '🪑', c: 'var(--text-main)' },
                        { label: 'Free',       val: stats.free,          icon: '✅', c: 'var(--accent-green)' },
                        { label: 'Orders',     val: stats.activeOrders,  icon: '📋', c: 'var(--accent-purple)' },
                        { label: 'Daily Rev',  val: `₹${stats.revenue}`, icon: '💰', c: 'var(--text-main)' },
                        { label: 'Daily Cash',       val: `₹${stats.cashRevenue}`, icon: '💵', c: '#fbbf24' },
                        { label: 'Daily Online',     val: `₹${stats.onlineRevenue}`, icon: '💳', c: '#60a5fa' }
                    ].map((s, i) => (

                        <div key={i} className="glass" style={{ padding: '16px 12px', borderRadius: '18px', textAlign: 'center' }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{s.icon}</p>
                            <p style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', fontWeight: '900', color: s.c, letterSpacing: '-0.04em' }}>{s.val}</p>
                            <p style={{ color: 'var(--text-faint)', fontSize: '0.65rem', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '800' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'var(--glass)', padding: '5px', borderRadius: '18px', overflowX: 'auto', flexWrap: 'nowrap' }}>
                    {[
                        { id: 'floor',     label: '🪑 Floor' },
                        { id: 'queue',     label: '📋 Queue' },
                        { id: 'takeaway',  label: '📦 Parcel' },
                        { id: 'history',   label: '📜 History' },
                        { id: 'inventory', label: '🏷️ Inventory' },
                        { id: 'categories', label: '📂 Categories' },
                        { id: 'customers', label: '👥 Customers' },

                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            style={{
                                padding: '10px 18px',
                                backgroundColor: activeTab === t.id ? 'var(--accent-white)' : 'transparent',
                                color: activeTab === t.id ? 'var(--bg-dark)' : 'var(--text-muted)',
                                border: 'none',
                                borderRadius: '14px',
                                fontWeight: '700',
                                fontSize: '0.85rem',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'customize' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        {/* Menu Management */}
                        <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h2 style={{ color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: '600', letterSpacing: '-0.02em' }}>Menu Management</h2>
                            </div>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const imageFile = formData.get('image');
                                let image_url = null;
                                
                                if (imageFile && imageFile.size > 0) {
                                    image_url = await handleImageUpload(imageFile);
                                }

                                const newItem = {
                                    name: sanitize(formData.get('name')),
                                    price: parseFloat(formData.get('price')),
                                    category: formData.get('category'),
                                    image_url: image_url,
                                    description: sanitize(formData.get('description')),
                                    is_available: true
                                };

                                const { error } = await supabase.from('menu_items').insert(newItem);
                                if (error) alert(error.message);
                                else {
                                    e.target.reset();
                                    fetchMenuItems();
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                                <input name="name" placeholder="Item Name" required className="glass" style={{ padding: '16px', borderRadius: '16px', color: 'var(--text-main)', outline: 'none' }} />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input name="price" type="number" placeholder="Price (₹)" required className="glass" style={{ flex: 1, padding: '16px', borderRadius: '16px', color: 'var(--text-main)', outline: 'none' }} />
                                    <select name="category" required className="glass" style={{ flex: 1, padding: '16px', borderRadius: '16px', color: 'var(--text-main)', outline: 'none', appearance: 'none' }}>
                                        <option value="" style={{ color: 'var(--bg-dark)' }}>Select Category</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.name} style={{ color: 'var(--bg-dark)' }}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <textarea name="description" placeholder="Description" className="glass" style={{ padding: '16px', borderRadius: '16px', color: 'var(--text-main)', minHeight: '80px', outline: 'none', resize: 'none' }}></textarea>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '4px' }}>Item Image</p>
                                    <input type="file" name="image" accept="image/*" className="glass" style={{ padding: '12px', borderRadius: '16px', color: 'var(--text-main)', outline: 'none' }} />
                                </div>
                                <button type="submit" disabled={isUploading} style={{ padding: '16px', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', fontWeight: '700', borderRadius: '16px', marginTop: '8px', opacity: isUploading ? 0.5 : 1 }}>
                                    {isUploading ? 'Uploading...' : 'Add Menu Item'}
                                </button>
                            </form>

                            <input 
                                type="text" 
                                placeholder="🔍 Search menu items..." 
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                className="glass"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    marginBottom: '16px'
                                }}
                            />

                            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                                {menuItems.filter(item => item.name.toLowerCase().includes(menuSearch.toLowerCase())).map(item => (
                                    <div key={item.id} className="glass" style={{ padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', opacity: item.is_available === false ? 0.4 : 1 }} />}
                                            <span style={{ fontWeight: '600', color: item.is_available === false ? 'var(--text-muted)' : 'var(--text-main)', textDecoration: item.is_available === false ? 'line-through' : 'none' }}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button 
                                                onClick={async () => {
                                                    await supabase.from('menu_items').update({ is_available: item.is_available === false ? true : false }).eq('id', item.id);
                                                    fetchMenuItems();
                                                }}
                                                style={{ color: item.is_available === false ? '#10b981' : '#f59e0b', background: 'var(--glass)', border: '1px solid var(--border-subtle)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                            >
                                                {item.is_available === false ? 'Mark Available' : 'Mark Unavailable'}
                                            </button>
                                            <button onClick={() => setMappingItem(item)} style={{ color: '#60a5fa', background: 'var(--glass)', border: '1px solid var(--border-subtle)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Recipe</button>
                                            <button onClick={() => setEditItem(item)} style={{ color: 'var(--accent-purple)', background: 'var(--glass)', border: '1px solid var(--border-subtle)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>Edit</button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`Delete ${item.name}?`)) {
                                                        await supabase.from('menu_items').delete().eq('id', item.id);
                                                        fetchMenuItems();
                                                    }
                                                }}
                                                style={{ color: '#f87171', background: 'none', border: 'none', padding: '6px', cursor: 'pointer', fontSize: '1rem' }}
                                            >✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Table Management */}
                        <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                            <h2 style={{ marginBottom: '24px', color: 'var(--text-main)', fontSize: '1.4rem', fontWeight: '600', letterSpacing: '-0.02em' }}>Table Management</h2>

                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const newTable = {
                                    id: parseInt(formData.get('id')),
                                    seats: parseInt(formData.get('seats')),
                                    is_free: true
                                };

                                const { error } = await supabase.from('tables').insert(newTable);
                                if (error) alert(error.message);
                                else {
                                    e.target.reset();
                                    fetchTables();
                                }
                            }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input name="id" type="number" placeholder="Table No." required className="glass" style={{ flex: 1, padding: '16px', borderRadius: '16px', color: 'var(--text-main)', outline: 'none' }} />
                                    <input name="seats" type="number" placeholder="Seats" required className="glass" style={{ flex: 1, padding: '16px', borderRadius: '16px', color: 'var(--text-main)', outline: 'none' }} />
                                </div>
                                <button type="submit" style={{ padding: '16px', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', fontWeight: '700', borderRadius: '16px', letterSpacing: '-0.01em' }}>Add Table</button>
                            </form>

                             <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                                {tables.map(table => (
                                    <div key={table.id} className="glass" style={{ padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                                        <span style={{ fontWeight: '500', color: 'var(--text-main)' }}>Table {table.id} <span style={{ color: 'var(--text-muted)' }}>({table.seats} Seats)</span></span>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button
                                                onClick={() => setQrTable(table)}
                                                style={{ backgroundColor: 'var(--glass)', border: '1px solid var(--border-subtle)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-main)' }}
                                            >QR</button>
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`Delete Table ${table.id}?`)) {
                                                        await supabase.from('tables').delete().eq('id', table.id);
                                                        fetchTables();
                                                    }
                                                }}
                                                style={{ backgroundColor: 'transparent', color: 'var(--text-faint)', border: 'none', padding: '6px', borderRadius: '8px' }}
                                            >✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setQrTable({ id: 0, isTakeaway: true })}
                                style={{
                                    width: '100%',
                                    marginTop: '20px',
                                    padding: '16px',
                                    backgroundColor: 'var(--glass)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '16px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                📋 + Generate Parcel QR (Table 0)
                            </button>

                            <button
                                onClick={() => setShowBulkQR(true)}
                                style={{
                                    width: '100%',
                                    marginTop: '12px',
                                    padding: '18px',
                                    backgroundColor: 'var(--accent-white)',
                                    color: 'var(--bg-dark)',
                                    fontWeight: '800',
                                    borderRadius: '18px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
                                    letterSpacing: '-0.01em'
                                }}
                            >
                                🖨️ Bulk Print QR Cards
                            </button>
                        </div>
                    </div>
                ) : activeTab === 'categories' ? (
                    <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: '800' }}>📂 Category Management</h2>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const imageFile = formData.get('image');
                            let image_url = null;
                            
                            if (imageFile && imageFile.size > 0) {
                                image_url = await handleImageUpload(imageFile);
                            }

                            const { error } = await supabase.from('categories').insert({
                                name: sanitize(formData.get('name')),
                                image_url: image_url
                            });

                            if (error) alert(error.message);
                            else {
                                e.target.reset();
                                fetchCategories();
                            }
                        }} style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div style={{ flex: 2, minWidth: '200px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', marginLeft: '4px' }}>Category Name</p>
                                <input name="name" placeholder="e.g. Burgers" required className="glass" style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', color: 'var(--text-main)', outline: 'none' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', marginLeft: '4px' }}>Image</p>
                                <input type="file" name="image" accept="image/*" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '16px', color: 'var(--text-main)', outline: 'none', fontSize: '0.8rem' }} />
                            </div>
                            <button type="submit" disabled={isUploading} style={{ padding: '14px 28px', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', fontWeight: '700', borderRadius: '16px', height: '48px', opacity: isUploading ? 0.5 : 1 }}>
                                {isUploading ? 'Uploading...' : 'Add Category'}
                            </button>
                        </form>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {categories.map(cat => (
                                <div key={cat.id} className="glass" style={{ padding: '20px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {cat.image_url ? (
                                            <img src={cat.image_url} alt={cat.name} style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>📂</div>
                                        )}
                                        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{cat.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button onClick={() => setEditCategory(cat)} style={{ color: 'var(--accent-purple)', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Edit</button>
                                        <button
                                            onClick={async () => {
                                                if (confirm(`Delete category ${cat.name}? Items in this category will become Uncategorized.`)) {
                                                    await supabase.from('categories').delete().eq('id', cat.id);
                                                    await supabase.from('menu_items').update({ category: 'Uncategorized' }).eq('category', cat.name);
                                                    fetchCategories();
                                                    fetchMenuItems();
                                                }
                                            }}
                                            style={{ color: '#f87171', background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}
                                        >✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === 'customers' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Customer Directory</h1>
                                <input 
                                    type="text" 
                                    placeholder="🔍 Search by name or phone..." 
                                    className="glass"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    style={{ padding: '12px 20px', borderRadius: '16px', color: 'var(--text-main)', width: '300px', outline: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                                {customerContacts
                                    .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone_number.includes(customerSearch))
                                    .map(customer => (
                                        <div key={customer.id} className="glass" style={{ padding: '20px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: 'var(--accent-white)', color: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '1.2rem' }}>
                                                {customer.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '2px' }}>{customer.name}</h3>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📞 {customer.phone_number}</p>
                                            </div>
                                            <button 
                                                onClick={async () => {
                                                    if (confirm(`Delete contact for ${customer.name}?`)) {
                                                        await supabase.from('customers').delete().eq('id', customer.id);
                                                        fetchCustomers();
                                                    }
                                                }}
                                                style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}
                                            >✕</button>
                                        </div>
                                    ))}
                                {customerContacts.length === 0 && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                                        No customer records found yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'inventory' ? (
                    <InventoryManager 
                        materials={materials} setMaterials={setMaterials}
                        recipes={invRecipes} setRecipes={setInvRecipes}
                        consumeLog={consumeLog} setConsumeLog={setConsumeLog}
                        restockLog={restockLog} setRestockLog={setRestockLog}
                        menuItems={menuItems}
                    />
                 ) : activeTab === 'floor' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                        {tables.map(table => {
                            const tableOrder = orders.find(
                                o => o.table_id === table.id && o.status !== 'paid' && o.status !== 'rejected'
                            );
                            const hasNewOrder = tableOrder?.status === 'new';
                            const isLinked = tableOrder?.items?.length === 1 && tableOrder.items[0].type === 'LINK';
                            const isOccupied = (!hasNewOrder && tableOrder) || (!table.is_free && !hasNewOrder);

                            return (
                                <div
                                    key={table.id}
                                    onClick={() => {
                                        if (isLinked) {
                                            const targetId = tableOrder.items[0].targetTable;
                                            const targetOrder = orders.find(o => o.table_id === targetId && o.status !== 'paid' && o.status !== 'rejected');
                                            if (targetOrder) setSelectedTableOrder(targetOrder);
                                        } else {
                                            handleTableClick(table);
                                        }
                                    }}
                                    className="glass"
                                    style={{
                                        padding: '32px 24px',
                                        borderRadius: '24px',
                                        border: isLinked ? '1px dashed rgba(255,255,255,0.2)' : isOccupied ? '1px solid rgba(255,159,67,0.3)' : (hasNewOrder ? '1px solid rgba(0,201,167,0.4)' : '1px solid rgba(255,255,255,0.08)'),
                                        backgroundColor: isLinked ? 'rgba(255,255,255,0.03)' : isOccupied ? 'rgba(255,159,67,0.1)' : (hasNewOrder ? 'rgba(0,201,167,0.1)' : 'rgba(255,255,255,0.02)'),
                                        color: isOccupied && !isLinked ? '#ff9f43' : (hasNewOrder ? '#00c9a7' : '#fff'),
                                        cursor: (isOccupied || hasNewOrder || isLinked) ? 'pointer' : 'default',
                                        position: 'relative',
                                        textAlign: 'center',
                                        transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                                    }}
                                >
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-end',
                                        gap: '4px'
                                    }}>
                                        <div style={{
                                            padding: '4px 10px',
                                            borderRadius: '16px',
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            letterSpacing: '0.05em',
                                            backgroundColor: isLinked ? 'rgba(255,255,255,0.1)' : isOccupied ? 'rgba(255,159,67,0.2)' : (hasNewOrder ? 'rgba(0,201,167,0.2)' : 'rgba(255,255,255,0.05)'),
                                            color: isLinked ? '#94a3b8' : isOccupied ? '#ff9f43' : (hasNewOrder ? '#00c9a7' : '#64748b')
                                        }}>
                                            {isLinked ? 'LINKED 🔗' : isOccupied ? 'OCCUPIED' : (hasNewOrder ? 'NEW ⚡' : 'FREE')}
                                        </div>


                                    </div>

                                    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                                        <h3 style={{ fontSize: '1.6rem', marginBottom: '8px', fontWeight: '900', letterSpacing: '-0.02em', color: isOccupied ? 'var(--bg-dark)' : '#fff' }}>Table {table.id}</h3>
                                        <p style={{ color: isOccupied ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{table.seats} Seats</p>

                                        {isOccupied && tableOrder && (
                                            <div style={{ 
                                                fontSize: '0.75rem', 
                                                fontWeight: '800', 
                                                color: 'var(--text-main)',
                                                backgroundColor: 'rgba(255,255,255,0.15)',
                                                padding: '6px 14px',
                                                borderRadius: '14px',
                                                marginTop: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                border: '1px solid rgba(255,255,255,0.2)'
                                            }}>
                                                ⏱️ {getDuration(tableOrder.created_at)}
                                            </div>
                                        )}

                                        {(isOccupied || hasNewOrder) ? (
                                            <div style={{ marginTop: '20px', color: isOccupied ? 'rgba(0,0,0,0.8)' : '#00c9a7', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.02em', borderBottom: '2px solid' }}>
                                                VIEW ORDER →
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowManualOrder(table.id); }}
                                                style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--glass)', border: '1px solid var(--border-subtle)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                                            >
                                                + Manual Order
                                            </button>
                                        )}
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ) : activeTab === 'takeaway' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button
                            onClick={() => setShowManualOrder(0)}
                            style={{
                                padding: '20px',
                                background: 'var(--accent-white)',
                                color: 'var(--bg-dark)',
                                borderRadius: '24px',
                                fontWeight: '800',
                                fontSize: '1rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                boxShadow: '0 8px 32px rgba(255,255,255,0.1)',
                                marginBottom: '8px'
                            }}
                        >
                            📦 + Place Manual Parcel Order
                        </button>
                        {orders.filter(o => o.table_id === 0 && o.status !== 'paid' && o.status !== 'rejected').map(order => {
                            const meta = order.items.find(i => i.type === 'METADATA');
                            const parcelNo = meta ? `P-${meta.takeaway_no}` : order.id;
                            const displayItems = order.items.filter(i => i.type !== 'METADATA');
                            
                            return (
                                <div key={order.id} className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Order #{parcelNo}</span>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '16px',
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                letterSpacing: '0.05em',
                                                backgroundColor: order.status === 'new' ? 'var(--text-main)' : 'var(--glass-hover)',
                                                color: order.status === 'new' ? 'var(--bg-dark)' : 'var(--text-main)',
                                                border: order.status === 'new' ? 'none' : '1px solid var(--border-subtle)'
                                            }}>
                                                {order.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>
                                            {displayItems.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: '24px' }}>
                                        <p style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>₹{order.total}</p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {order.status === 'new' ? (
                                                <button
                                                    onClick={() => acceptOrder(order.id, 0)}
                                                    style={{ padding: '8px 20px', fontSize: '0.9rem', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', borderRadius: '16px', fontWeight: '700' }}
                                                >
                                                    Ready
                                                </button>
                                            ) : (
                                                handoverOrderId === order.id ? (
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => { setHandoverOrderId(null); completeTakeaway(order.id, 'Cash'); }}
                                                            style={{ padding: '8px 16px', fontSize: '0.85rem', backgroundColor: '#fbbf24', color: '#000', borderRadius: '16px', fontWeight: '700' }}
                                                        >
                                                            Cash
                                                        </button>
                                                        <button
                                                            onClick={() => { setHandoverOrderId(null); completeTakeaway(order.id, 'Online'); }}
                                                            style={{ padding: '8px 16px', fontSize: '0.85rem', backgroundColor: '#60a5fa', color: '#000', borderRadius: '16px', fontWeight: '700' }}
                                                        >
                                                            Online
                                                        </button>
                                                        <button
                                                            onClick={() => setHandoverOrderId(null)}
                                                            style={{ padding: '8px 12px', fontSize: '0.85rem', backgroundColor: 'var(--glass)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', borderRadius: '16px', fontWeight: '700' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setHandoverOrderId(order.id)}
                                                        style={{ padding: '8px 20px', fontSize: '0.9rem', backgroundColor: '#4ade80', color: '#000', borderRadius: '16px', fontWeight: '700' }}
                                                    >
                                                        Handover
                                                    </button>
                                                )
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setInvoiceOrder(order); }}
                                                style={{ padding: '8px 20px', fontSize: '0.9rem', backgroundColor: 'var(--glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: '16px', fontWeight: '600' }}
                                            >
                                                Invoice
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {orders.filter(o => o.table_id === 0 && o.status !== 'paid' && o.status !== 'rejected').length === 0 && (
                            <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500', letterSpacing: '-0.01em' }}>
                                No active parcel orders
                            </div>
                        )}
                    </div>
                ) : activeTab === 'history' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px', background: 'var(--glass)', padding: '5px', borderRadius: '16px', width: 'fit-content' }}>
                            {['all', 'dine-in', 'parcel'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setHistoryFilter(f)}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: historyFilter === f ? 'var(--accent-white)' : 'transparent',
                                        color: historyFilter === f ? 'var(--bg-dark)' : 'var(--text-muted)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {f === 'all' ? '📜 All History' : f === 'dine-in' ? '🪑 Dine-In' : '📦 Parcel'}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {orders
                                .filter(o => o.status === 'paid')
                                .filter(o => {
                                    if (historyFilter === 'all') return true;
                                    if (historyFilter === 'dine-in') return o.table_id > 0;
                                    if (historyFilter === 'parcel') return o.table_id === 0;
                                    return true;
                                })
                                .sort((a,b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
                                .map(order => {
                                    const meta = order.items.find(i => i.type === 'METADATA');
                                    const payMeta = order.items.find(i => i.type === 'PAYMENT_METADATA');
                                    const parcelNo = meta ? `P-${meta.takeaway_no}` : null;
                                    const sessionTime = order.table_id > 0 ? Math.floor((new Date(order.updated_at).getTime() - new Date(order.created_at).getTime()) / 60000) : null;
                                    
                                    return (
                                        <div 
                                            key={order.id} 
                                            onClick={() => setSelectedHistoryOrder(order)}
                                            className="glass history-item-row" 
                                            style={{ 
                                                padding: '20px 24px', 
                                                borderRadius: '24px', 
                                                display: 'flex', 
                                                justifyContent: 'space-between', 
                                                alignItems: 'center', 
                                                border: '1px solid var(--border-subtle)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                marginBottom: '10px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
                                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                                    {order.table_id === 0 ? '📦' : '🪑'}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                                            {order.table_id === 0 ? `Parcel #${parcelNo || order.id}` : `Table ${order.table_id}`}
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: '0.65rem', 
                                                            fontWeight: '800', 
                                                            color: order.status === 'paid' ? '#4ade80' : '#f87171',
                                                            backgroundColor: order.status === 'paid' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {order.status}
                                                        </span>
                                                        <span style={{ 
                                                            fontSize: '0.65rem', 
                                                            fontWeight: '800', 
                                                            color: payMeta?.method === 'Online' ? '#60a5fa' : '#fbbf24',
                                                            backgroundColor: payMeta?.method === 'Online' ? 'rgba(96,165,250,0.1)' : 'rgba(251,191,36,0.1)',
                                                            padding: '2px 8px',
                                                            borderRadius: '6px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {payMeta?.method || 'CASH'}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>
                                                        {order.items.filter(i => i.type !== 'METADATA').map(i => `${i.qty}x ${i.name}`).join(', ')}
                                                    </p>
                                                    <p style={{ color: 'var(--text-faint)', fontSize: '0.8rem', marginTop: '4px' }}>
                                                        {new Date(order.updated_at || order.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}, {new Date(order.updated_at || order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--text-main)' }}>₹{order.total}</p>
                                                <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>›</div>
                                            </div>
                                        </div>

                                    );
                                })}
                            
                            {orders.filter(o => o.status === 'paid').length === 0 && (
                                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                                    No history found.
                                </div>
                            )}
                        </div>
                    </div>

                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {orders.filter(o => o.table_id !== 0 && o.status !== 'paid' && o.status !== 'rejected' && !(o.items?.length === 1 && o.items[0].type === 'LINK')).map(order => (
                            <div key={order.id} className="glass" style={{ padding: '24px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Table {order.table_id}</span>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '16px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            letterSpacing: '0.05em',
                                            backgroundColor: order.status === 'new' ? 'var(--text-main)' : 'var(--glass-hover)',
                                            color: order.status === 'new' ? 'var(--bg-dark)' : 'var(--text-main)',
                                            border: order.status === 'new' ? 'none' : '1px solid var(--border-subtle)'
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500' }}>
                                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <p style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>₹{order.total}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setInvoiceOrder(order); }}
                                        style={{ padding: '8px 20px', fontSize: '0.9rem', backgroundColor: 'var(--glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', borderRadius: '16px', fontWeight: '600' }}
                                    >
                                        Invoice Details
                                    </button>
                                </div>
                            </div>
                        ))}
                        {orders.filter(o => o.table_id !== 0 && o.status !== 'paid' && o.status !== 'rejected' && !(o.items?.length === 1 && o.items[0].type === 'LINK')).length === 0 && (
                            <div style={{ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '500', letterSpacing: '-0.01em' }}>
                                No active orders in queue
                            </div>
                        )}
                    </div>
                )}

                {/* Order Detail Modal */}
                {selectedTableOrder && (
                    <div className="animate-overlay" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        zIndex: 2000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '24px'
                    }}>
                        <div className="glass modal-content" style={{ 
                            width: '100%', 
                            maxWidth: '560px', 
                            maxHeight: '95vh',
                            borderRadius: '24px', 
                            padding: '32px', 
                            backgroundColor: 'var(--bg-surface)', 
                            boxShadow: 'var(--shadow-xl), 0 0 0 1px var(--border-subtle)', 
                            display: 'flex', 
                            flexDirection: 'column' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center', flexWrap: 'nowrap', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                                    <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
                                        {selectedTableOrder.table_id === 0 ? `Parcel #${selectedTableOrder.items.find(i => i.type === 'METADATA')?.takeaway_no || selectedTableOrder.id}` : `Table ${selectedTableOrder.table_id}`}
                                    </h2>
                                    
                                    <div style={{ position: 'relative' }}>
                                        <button 
                                            onClick={() => setShowOrderCustomize(!showOrderCustomize)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '12px', background: 'var(--glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            ⚙️ Customize ▾
                                        </button>
                                        {showOrderCustomize && (
                                            <div className="glass" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', zIndex: 3000, width: '180px', padding: '8px', borderRadius: '16px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)' }}>
                                                <button onClick={() => { setShowTransferModal(selectedTableOrder); setShowOrderCustomize(false); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>➡️ Transfer Table</button>
                                                <button onClick={() => { setShowCombineModal(selectedTableOrder); setShowOrderCustomize(false); }} style={{ width: '100%', padding: '10px 12px', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>🔗 Combine Table</button>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ 
                                        fontSize: '0.8rem', 
                                        fontWeight: '800', 
                                        color: '#4ade80',
                                        backgroundColor: 'rgba(74,222,128,0.1)',
                                        padding: '8px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(74,222,128,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        ⏱️ {getDuration(selectedTableOrder.created_at)}
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTableOrder(null)} style={{ background: 'var(--glass)', border: '1px solid var(--border-subtle)', width: '48px', height: '48px', borderRadius: '24px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>✕</button>

                            </div>


                            <div style={{ flex: 1, overflowY: 'auto', minHeight: '0', display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
                                {/* Scrollable Items List */}
                                <div style={{ marginBottom: '24px', paddingRight: '12px' }}>
                                    {(() => {
                                        const validItems = selectedTableOrder.items.filter(i => i.type !== 'METADATA' && i.type !== 'PAYMENT_METADATA');
                                        const dineInItems = validItems.filter(i => !i.isParcel);
                                        const parcelItems = validItems.filter(i => i.isParcel);

                                        const renderItem = (item, idxKey) => (
                                            <div key={idxKey} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-main)', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--glass)', padding: '4px 8px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                                                        <button 
                                                            onClick={() => handleUpdateItemQty(selectedTableOrder.id, item.name, -1, item.isParcel)}
                                                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.2rem', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}
                                                        >
                                                            -
                                                        </button>
                                                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '700', fontSize: '0.95rem' }}>{item.qty}</span>
                                                        <button 
                                                            onClick={() => handleUpdateItemQty(selectedTableOrder.id, item.name, 1, item.isParcel)}
                                                            style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '1.2rem', cursor: 'pointer', padding: '0 4px', fontWeight: 'bold' }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <span style={{ fontWeight: '500' }}>{item.name}</span>
                                                </div>
                                                <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{item.price * item.qty}</span>
                                            </div>
                                        );

                                        return (
                                            <>
                                                {dineInItems.map((item, i) => renderItem(item, `dine-${i}`))}
                                                {parcelItems.length > 0 && (
                                                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontSize: '1.2rem' }}>📦</span>
                                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Parcel Items</span>
                                                        </div>
                                                        {parcelItems.map((item, i) => renderItem(item, `parcel-${i}`))}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', letterSpacing: '-0.02em', color: 'var(--text-main)', flexWrap: 'wrap', gap: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', alignSelf: 'center' }}>Total</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>₹</span>
                                        <input 
                                            type="number"
                                            value={editTotal}
                                            onChange={(e) => {
                                                const newTotal = parseFloat(e.target.value) || 0;
                                                setEditTotal(newTotal);
                                                if (isSplitPayment) {
                                                    setSplitOnlineAmount(Math.max(0, newTotal - splitCashAmount));
                                                }
                                            }}
                                            onBlur={async () => {
                                                if (editTotal !== selectedTableOrder.total) {
                                                    await supabase.from('orders').update({ total: editTotal }).eq('id', selectedTableOrder.id);
                                                    setSelectedTableOrder(prev => ({ ...prev, total: editTotal }));
                                                }
                                            }}
                                            style={{ 
                                                width: '100px', 
                                                background: 'var(--glass)', 
                                                border: '1px solid var(--border-subtle)', 
                                                borderRadius: '12px', 
                                                color: 'var(--text-main)', 
                                                fontSize: '1.4rem', 
                                                fontWeight: '800',
                                                padding: '4px 8px',
                                                textAlign: 'right',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Add Item Section */}
                                <div style={{ marginTop: '20px', borderTop: '1px dashed var(--border-subtle)', paddingTop: '20px' }}>
                                    {!isAddingItem ? (
                                        <button 
                                            onClick={() => setIsAddingItem(true)}
                                            style={{ 
                                                width: '100%', 
                                                padding: '12px', 
                                                backgroundColor: 'rgba(255,255,255,0.05)', 
                                                border: '1px solid var(--border-subtle)', 
                                                borderRadius: '12px', 
                                                color: 'var(--text-main)', 
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            + Add Item
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Search item..." 
                                                    value={addItemSearch}
                                                    onChange={(e) => setAddItemSearch(e.target.value)}
                                                    autoFocus
                                                    className="glass"
                                                    style={{ flex: 1, padding: '10px 16px', borderRadius: '12px', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: '0.9rem' }}
                                                />
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
                                                    <input type="checkbox" checked={isAddNewAsParcel} onChange={(e) => setIsAddNewAsParcel(e.target.checked)} style={{ cursor: 'pointer' }} />
                                                    Add as Parcel
                                                </label>
                                                <button onClick={() => { setIsAddingItem(false); setAddItemSearch(''); setIsAddNewAsParcel(false); }} style={{ background: 'var(--glass)', border: '1px solid var(--border-subtle)', width: '40px', borderRadius: '12px', color: 'var(--text-main)' }}>✕</button>
                                            </div>
                                            {addItemSearch && (
                                                <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
                                                    {menuItems
                                                        .filter(i => i.is_available !== false)
                                                        .filter(i => i.name.toLowerCase().includes(addItemSearch.toLowerCase()))
                                                        .map(item => (
                                                            <button 
                                                                key={item.id}
                                                                onClick={async () => {
                                                                    await placeManualOrder(selectedTableOrder.table_id, [{ ...item, qty: 1, isParcel: isAddNewAsParcel }]);
                                                                    setIsAddingItem(false);
                                                                    setAddItemSearch('');
                                                                    setIsAddNewAsParcel(false);
                                                                    // The real-time subscription or fetchInitialData inside placeManualOrder will update selectedTableOrder via orders state
                                                                    // But since selectedTableOrder is local state, we should find it again
                                                                    const updatedOrders = await supabase.from('orders').select('*');
                                                                    if (updatedOrders.data) {
                                                                        const latest = updatedOrders.data.find(o => o.id === selectedTableOrder.id);
                                                                        if (latest) setSelectedTableOrder(latest);
                                                                    }
                                                                }}
                                                                style={{ 
                                                                    display: 'flex', 
                                                                    justifyContent: 'space-between', 
                                                                    padding: '12px 16px', 
                                                                    backgroundColor: 'rgba(255,255,255,0.03)', 
                                                                    border: '1px solid var(--border-subtle)', 
                                                                    borderRadius: '12px', 
                                                                    color: 'var(--text-main)',
                                                                    textAlign: 'left',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <span style={{ fontWeight: '500', flex: 1, marginRight: '12px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{item.name}</span>
                                                                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>₹{item.price}</span>
                                                            </button>
                                                        ))
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Customer Info for Direct Payment */}
                                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ position: 'relative' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Customer Phone (10 digits)"
                                            className="glass"
                                            value={payPhone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                setPayPhone(val);
                                                checkCustomerByPhone(val);
                                            }}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: '1rem' }}
                                        />
                                        {payExists && (
                                            <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#4ade80', fontWeight: '800' }}>
                                                ✅ Exists
                                            </span>
                                        )}
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Customer Name"
                                        className="glass"
                                        value={payName}
                                        onChange={(e) => setPayName(e.target.value)}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: '1rem' }}
                                    />
                                    {payExists && (
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>* Returning customer detected</p>
                                    )}
                                </div>

                                {/* Split Payment Controls */}
                                {isSplitPayment && (
                                    <div className="glass animate-fade" style={{ padding: '20px', borderRadius: '20px', border: '1px solid var(--border-subtle)', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--amber)' }}>SPLIT PAYMENT</span>
                                            <button onClick={() => setIsSplitPayment(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕ Cancel</button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>CASH AMOUNT</label>
                                                <input 
                                                    type="number"
                                                    value={splitCashAmount}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        setSplitCashAmount(val);
                                                        setSplitOnlineAmount(Math.max(0, editTotal - val));
                                                    }}
                                                    className="glass"
                                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', fontSize: '1.1rem', fontWeight: '700' }}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>ONLINE AMOUNT</label>
                                                <input 
                                                    type="number"
                                                    value={splitOnlineAmount}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        setSplitOnlineAmount(val);
                                                        setSplitCashAmount(Math.max(0, editTotal - val));
                                                    }}
                                                    className="glass"
                                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', fontSize: '1.1rem', fontWeight: '700' }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: (splitCashAmount + splitOnlineAmount === editTotal) ? 'var(--teal)' : '#f87171', textAlign: 'center', fontWeight: '600' }}>
                                            {(splitCashAmount + splitOnlineAmount === editTotal) 
                                                ? '✓ Amounts match total' 
                                                : `⚠ Total sum must be ₹${editTotal} (Current: ₹${splitCashAmount + splitOnlineAmount})`}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexShrink: 0 }}>
                                {!isSplitPayment ? (
                                    <>
                                        <button
                                            onClick={() => selectedTableOrder.table_id == 0 ? completeTakeaway(selectedTableOrder.id, 'Cash') : markTableFree(selectedTableOrder.table_id, 'Cash')}
                                            style={{ height: '60px', flex: 1, backgroundColor: '#ffbd2e', color: '#000', fontWeight: '900', borderRadius: '20px', cursor: 'pointer', border: 'none', fontSize: '1rem', boxShadow: '0 4px 12px rgba(255,189,46,0.2)' }}
                                        >
                                            Paid CASH
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsSplitPayment(true);
                                                setSplitCashAmount(editTotal);
                                                setSplitOnlineAmount(0);
                                            }}
                                            style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: '700', borderRadius: '20px', cursor: 'pointer' }}
                                        >
                                            +
                                        </button>
                                        <button
                                            onClick={() => selectedTableOrder.table_id == 0 ? completeTakeaway(selectedTableOrder.id, 'Online') : markTableFree(selectedTableOrder.table_id, 'Online')}
                                            style={{ height: '60px', flex: 1, backgroundColor: '#3b82f6', color: '#fff', fontWeight: '900', borderRadius: '20px', cursor: 'pointer', border: 'none', fontSize: '1rem', boxShadow: '0 4px 12px rgba(59,130,246,0.2)' }}
                                        >
                                            Paid ONLINE
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        disabled={splitCashAmount + splitOnlineAmount !== editTotal}
                                        onClick={() => selectedTableOrder.table_id == 0 ? completeTakeaway(selectedTableOrder.id, 'Split', { cash: splitCashAmount, online: splitOnlineAmount }) : markTableFree(selectedTableOrder.table_id, 'Split', { cash: splitCashAmount, online: splitOnlineAmount })}
                                        style={{ height: '60px', flex: 2, backgroundColor: 'var(--teal)', color: '#000', fontWeight: '900', borderRadius: '20px', cursor: (splitCashAmount + splitOnlineAmount !== editTotal) ? 'not-allowed' : 'pointer', opacity: (splitCashAmount + splitOnlineAmount !== editTotal) ? 0.5 : 1, border: 'none' }}
                                    >
                                        Confirm Split Payment
                                    </button>
                                )}
                                <button
                                    onClick={() => setInvoiceOrder(selectedTableOrder)}
                                    style={{ height: '60px', width: '110px', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', fontWeight: '900', borderRadius: '20px', cursor: 'pointer', border: 'none', fontSize: '1rem' }}
                                >
                                    Invoice
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* QR Modal */}
            {qrTable && (
                <div className="animate-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    zIndex: 3000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div className="glass modal-content" style={{
                        width: '100%',
                        maxWidth: '430px',
                        borderRadius: '32px',
                        padding: '40px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '32px',
                        backgroundColor: 'var(--bg-surface)',
                        position: 'relative',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <button 
                            onClick={() => setQrTable(null)} 
                            style={{ 
                                position: 'absolute', 
                                top: '20px', 
                                right: '20px', 
                                background: 'var(--glass)', 
                                border: '1px solid var(--border-subtle)', 
                                width: '36px', 
                                height: '36px', 
                                borderRadius: '18px', 
                                color: 'var(--text-main)', 
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                        >✕</button>

                        {/* Designed QR Card for Printing */}
                        <div id="qr-to-print" style={{ 
                            position: 'relative',
                            width: '320px',
                            height: '480px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                            overflow: 'hidden',
                            backgroundColor: '#26817B',
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
                                        value={`${qrBaseUrl.startsWith('http') ? '' : window.location.protocol + '//'}${qrBaseUrl.replace(/\/$/, '')}/menu?table=${qrTable.id}&tk=${qrTable.isTakeaway ? '1' : '0'}`}
                                        size={150}
                                        style={{ width: '150px', height: '150px', marginBottom: '8px' }}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        level="H"
                                        includeMargin={false}
                                    />
                                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#000', textAlign: 'center', fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>
                                        {qrTable.isTakeaway ? 'PARCEL' : `TABLE ${qrTable.id}`}
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
                        </div>

                        {/* Test Link for PC Testing */}
                        <button 
                            className="no-print" 
                            onClick={() => {
                                const urlPrefix = qrBaseUrl.startsWith('http') ? qrBaseUrl : `${window.location.protocol}//${qrBaseUrl}`;
                                window.open(`${urlPrefix.replace(/\/$/, '')}/menu?table=${qrTable.id}&tk=${qrTable.isTakeaway ? '1' : '0'}`, '_blank');
                            }} 
                            style={{ 
                                width: '100%', 
                                padding: '16px', 
                                backgroundColor: '#26817B', 
                                borderRadius: '16px', 
                                border: '1px solid #E3C565',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                color: '#E3C565',
                                fontWeight: '800',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                            }}
                        >
                            🔗 Open Menu (PC Test)
                        </button>

                        <button
                            className="no-print"
                            onClick={() => {
                                const style = document.createElement('style');
                                style.innerHTML = `
                                    @media print {
                                        body * { visibility: hidden !important; }
                                        #qr-to-print, #qr-to-print * { visibility: visible !important; }
                                        #qr-to-print { 
                                            position: absolute !important; 
                                            left: 0 !important; 
                                            top: 0 !important; 
                                            margin: 0 !important;
                                            padding: 0 !important;
                                            width: 100mm !important;
                                            height: 150mm !important;
                                            box-shadow: none !important;
                                            border: none !important;
                                            print-color-adjust: exact !important;
                                            -webkit-print-color-adjust: exact !important;
                                            display: block !important;
                                        }
                                    }
                                `;
                                document.head.appendChild(style);
                                window.print();
                                document.head.removeChild(style);
                            }}
                            style={{ width: '100%', padding: '16px', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', fontWeight: '700', borderRadius: '16px', letterSpacing: '-0.01em', fontSize: '1rem', cursor: 'pointer' }}
                        >
                            🖨️ Print QR Design
                        </button>
                    </div>
                </div>
            )}

            {/* Real-time Order Popup */}
            {newOrder && (
                <OrderPopup
                    order={newOrder}
                    onAccept={acceptOrder}
                    onDismiss={() => rejectOrder(newOrder)}
                    onUpdateItemQty={handleUpdateItemQty}
                    currentTime={currentTime}
                />
            )}

            {/* Invoice Modal */}
            <InvoiceModal
                order={invoiceOrder}
                isOpen={!!invoiceOrder}
                onClose={() => setInvoiceOrder(null)}
                onPaid={(method) => invoiceOrder.table_id == 0 ? completeTakeaway(invoiceOrder.id, method) : markTableFree(invoiceOrder.table_id, method)}
            />

            {/* Bulk QR Modal */}
            <BulkQRModal
                tables={tables}
                isOpen={showBulkQR}
                onClose={() => setShowBulkQR(false)}
                qrBaseUrl={qrBaseUrl}
            />

            {/* Recipe Mapping Modal */}
            {mappingItem && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
                    <div className="glass modal-content" style={{ width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Recipe: {mappingItem.name}</h3>
                            <button onClick={() => { setMappingItem(null); setNewMatId(''); setNewMatQty(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem' }}>✕</button>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Define raw materials used per serving of this item.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                            {(invRecipes.find(r => r.menuItemId === mappingItem.id)?.recipe || []).map((ing, i) => {
                                const mat = materials.find(m => m.id === ing.materialId);
                                return (
                                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                                        <span style={{ flex: 1, fontWeight: '600' }}>{mat?.name || 'Unknown'}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{ing.qty} {mat?.unit}</span>
                                        <button
                                            onClick={() => {
                                                const current = invRecipes.find(r => r.menuItemId === mappingItem.id);
                                                const newRecipe = current.recipe.filter((_, idx) => idx !== i);
                                                setInvRecipes(prev => prev.map(r => r.menuItemId === mappingItem.id ? { ...r, recipe: newRecipe } : r));
                                            }}
                                            style={{ color: '#f87171', background: 'none', border: 'none' }}
                                        >✕</button>
                                    </div>
                                );
                            })}

                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <select
                                    className="glass"
                                    value={newMatId}
                                    onChange={(e) => setNewMatId(e.target.value)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.85rem' }}
                                >
                                    <option value="">Select Material</option>
                                    {materials.map(m => <option key={m.id} value={m.id} style={{color:'var(--bg-dark)'}}>{m.name}</option>)}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={newMatQty}
                                    onChange={(e) => setNewMatQty(e.target.value)}
                                    className="glass"
                                    style={{ width: '80px', padding: '12px', borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.85rem' }}
                                />
                                <button
                                    onClick={() => {
                                        if (!newMatId || !newMatQty) return;
                                        const existing = invRecipes.find(r => r.menuItemId === mappingItem.id);
                                        if (existing) {
                                            setInvRecipes(prev => prev.map(r => r.menuItemId === mappingItem.id ? { ...r, recipe: [...r.recipe, { materialId: newMatId, qty: Number(newMatQty) }] } : r));
                                        } else {
                                            setInvRecipes(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name: mappingItem.name, menuItemId: mappingItem.id, recipe: [{ materialId: newMatId, qty: Number(newMatQty) }] }]);
                                        }
                                        setNewMatQty('');
                                    }}
                                    style={{ padding: '12px', background: 'var(--accent-white)', color: 'var(--bg-dark)', borderRadius: '12px', fontWeight: '700' }}
                                >Add</button>
                            </div>
                        </div>

                        <button onClick={() => setMappingItem(null)} style={{ width: '100%', padding: '16px', background: 'var(--glass)', border: '1px solid var(--border-subtle)', borderRadius: '16px', fontWeight: '700', color: 'var(--text-main)' }}>Done</button>
                    </div>
                </div>
            )}
            {/* Manual Order Modal */}
            {showManualOrder !== null && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: '20px' }}>
                    <div className="glass modal-content" style={{ width: '100%', maxWidth: '900px', height: '90vh', borderRadius: '32px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Manual Order — {showManualOrder === 0 ? 'Takeaway' : `Table ${showManualOrder}`}</h2>
                            <button onClick={() => { setShowManualOrder(null); setManualCart([]); setManualSearch(''); setManualCategory('all'); }} style={{ background: 'var(--glass)', border: '1px solid var(--border-subtle)', width: '40px', height: '40px', borderRadius: '20px', color: 'var(--text-main)' }}>✕</button>
                        </div>

                        <div style={{ flex: 1, display: 'flex', gap: '24px', overflow: 'hidden' }}>
                            {/* Menu Selection */}
                            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '8px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="🔍 Search items by name..." 
                                        value={manualSearch}
                                        onChange={(e) => setManualSearch(e.target.value)}
                                        className="glass" 
                                        style={{ width: '100%', padding: '14px 20px', borderRadius: '16px', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', outline: 'none' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 0', scrollbarWidth: 'none' }}>
                                        {['all', ...categories.map(c => c.name)].map(catName => (
                                            <button 
                                                key={catName} 
                                                onClick={() => setManualCategory(catName)}
                                                style={{ 
                                                    padding: '10px 24px', 
                                                    backgroundColor: manualCategory === catName ? 'var(--accent-white)' : 'var(--glass)', 
                                                    color: manualCategory === catName ? 'var(--bg-dark)' : 'var(--text-main)', 
                                                    border: '1px solid var(--border-subtle)', 
                                                    borderRadius: '24px', 
                                                    fontSize: '0.85rem', 
                                                    fontWeight: '700',
                                                    whiteSpace: 'nowrap',
                                                    transition: 'all 0.2s',
                                                    minWidth: 'fit-content'
                                                }}
                                            >
                                                {catName.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                                    {menuItems
                                        .filter(i => i.is_available !== false)
                                        .filter(i => manualCategory === 'all' || i.category === manualCategory)
                                        .filter(i => i.name.toLowerCase().includes(manualSearch.toLowerCase()))
                                        .map(item => (
                                            <div 
                                                key={item.id} 
                                                onClick={() => {
                                                    const existing = manualCart.find(i => i.id === item.id);
                                                    if (existing) {
                                                        setManualCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
                                                    } else {
                                                        setManualCart(prev => [...prev, { ...item, qty: 1 }]);
                                                    }
                                                }}
                                                className="glass" 
                                                style={{ padding: '12px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer' }}
                                            >
                                                <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                    {item.image_url ? <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}
                                                </div>
                                                <p style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '2px' }}>{item.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{item.price}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Cart Summary */}
                            <div className="glass" style={{ flex: 1, padding: '24px', borderRadius: '24px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Selected Items</h3>
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {manualCart.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.name}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.price * item.qty}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <button 
                                                    onClick={() => {
                                                        setManualCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: Math.max(0, i.qty - 1) } : i).filter(i => i.qty > 0));
                                                    }}
                                                    style={{ width: '30px', height: '30px', borderRadius: '15px', border: 'none', backgroundColor: '#f87171', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >-</button>
                                                <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                                                <button 
                                                    onClick={() => {
                                                        setManualCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
                                                    }}
                                                    style={{ width: '30px', height: '30px', borderRadius: '15px', border: 'none', backgroundColor: '#4ade80', color: '#000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >+</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: '800', fontSize: '1.2rem' }}>
                                        <span>Total</span>
                                        <span>₹{manualCart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0)}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (manualCart.length === 0) return;
                                            placeManualOrder(showManualOrder, manualCart);
                                            setManualCart([]);
                                        }}
                                        style={{ width: '100%', padding: '16px', background: 'var(--accent-white)', color: 'var(--bg-dark)', borderRadius: '16px', fontWeight: '800' }}
                                    >
                                        Place Manual Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Menu Item Modal */}
            {editItem && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: '20px' }}>
                        <div className="glass modal-content" style={{ width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Edit Item: {editItem.name}</h2>
                            <button onClick={() => setEditItem(null)} style={{ background: 'var(--glass)', border: '1px solid var(--border-subtle)', width: '36px', height: '36px', borderRadius: '18px', color: 'white' }}>✕</button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const imageFile = formData.get('image');
                            let image_url = editItem.image_url;
                            
                            if (imageFile && imageFile.size > 0) {
                                image_url = await handleImageUpload(imageFile);
                            }

                            const updates = {
                                name: sanitize(formData.get('name')),
                                price: Math.max(0, parseInt(formData.get('price')) || 0),
                                category: sanitize(formData.get('category')),
                                description: sanitize(formData.get('description')),
                                image_url: image_url,
                                is_veg: formData.get('is_veg') === 'on',
                                is_signature: formData.get('is_signature') === 'on',
                                discount_pct: Math.min(100, Math.max(0, parseInt(formData.get('discount_pct')) || 0))
                            };

                            const { error } = await supabase.from('menu_items').update(updates).eq('id', editItem.id);
                            if (error) alert(error.message);
                            else {
                                setEditItem(null);
                                fetchMenuItems();
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input name="name" defaultValue={editItem.name} placeholder="Item Name" required className="glass" style={{ padding: '14px', borderRadius: '14px', color: 'var(--text-main)', outline: 'none' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input name="price" type="number" defaultValue={editItem.price} placeholder="Price" required className="glass" style={{ flex: 1, padding: '14px', borderRadius: '14px', color: 'var(--text-main)' }} />
                                <select name="category" defaultValue={editItem.category} className="glass" style={{ flex: 1, padding: '14px', borderRadius: '14px', color: 'var(--text-main)', appearance: 'none' }}>
                                    {categories.map(cat => <option key={cat.id} value={cat.name} style={{ color: '#000' }}>{cat.name}</option>)}
                                </select>
                            </div>
                            <textarea name="description" defaultValue={editItem.description} placeholder="Description" className="glass" style={{ padding: '14px', borderRadius: '14px', color: 'var(--text-main)', minHeight: '80px' }} />
                            <div style={{ fontSize: '0.8rem' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Update Image (Optional)</p>
                                <input type="file" name="image" accept="image/*" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '12px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
                                <label><input type="checkbox" name="is_veg" defaultChecked={editItem.is_veg} /> Veg</label>
                                <label><input type="checkbox" name="is_signature" defaultChecked={editItem.is_signature} /> Signature</label>
                            </div>
                            <button type="submit" disabled={isUploading} style={{ padding: '16px', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', fontWeight: '800', borderRadius: '16px', marginTop: '12px' }}>
                                {isUploading ? 'Uploading...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Category Modal */}
            {editCategory && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: '20px' }}>
                        <div className="glass modal-content" style={{ width: '100%', maxWidth: '500px', borderRadius: '32px', padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Edit Category: {editCategory.name}</h2>
                            <button onClick={() => setEditCategory(null)} style={{ background: 'var(--glass)', border: '1px solid var(--border-subtle)', width: '36px', height: '36px', borderRadius: '18px', color: 'white' }}>✕</button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const imageFile = formData.get('image');
                            let image_url = editCategory.image_url;
                            
                            if (imageFile && imageFile.size > 0) {
                                image_url = await handleImageUpload(imageFile);
                            }

                            const newName = sanitize(formData.get('name'));
                            const { error } = await supabase.from('categories').update({
                                name: newName,
                                image_url: image_url
                            }).eq('id', editCategory.id);

                            if (error) alert(error.message);
                            else {
                                // Sync menu items if name changed
                                if (newName !== editCategory.name) {
                                    await supabase.from('menu_items').update({ category: newName }).eq('category', editCategory.name);
                                }
                                setEditCategory(null);
                                fetchCategories();
                                fetchMenuItems();
                            }
                        }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input name="name" defaultValue={editCategory.name} placeholder="Category Name" required className="glass" style={{ padding: '14px', borderRadius: '14px', color: 'var(--text-main)', outline: 'none' }} />
                            <div style={{ fontSize: '0.8rem' }}>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Update Image (Optional)</p>
                                <input type="file" name="image" accept="image/*" className="glass" style={{ width: '100%', padding: '10px', borderRadius: '12px' }} />
                            </div>
                            <button type="submit" disabled={isUploading} style={{ padding: '16px', backgroundColor: 'var(--accent-white)', color: 'var(--bg-dark)', fontWeight: '800', borderRadius: '16px', marginTop: '12px' }}>
                                {isUploading ? 'Uploading...' : 'Save Category Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Table Modal */}
            {showTransferModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: '20px' }}>
                        <div className="glass modal-content" style={{ width: '100%', maxWidth: '400px', borderRadius: '32px', padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Transfer Table {showTransferModal.table_id}</h2>
                            <button onClick={() => setShowTransferModal(null)} style={{ background: 'var(--glass)', border: '1px solid var(--border-subtle)', width: '36px', height: '36px', borderRadius: '18px', color: 'white' }}>✕</button>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Select an available table to transfer to:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                            {tables.filter(t => t.is_free && t.id !== showTransferModal.table_id).map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        transferOrderToTable(showTransferModal.id, showTransferModal.table_id, t.id);
                                        setShowTransferModal(null);
                                    }}
                                    style={{ flex: '1 1 calc(33.333% - 12px)', padding: '16px', borderRadius: '16px', backgroundColor: 'var(--glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)', fontWeight: '700', fontSize: '1.2rem', cursor: 'pointer' }}
                                >
                                    T-{t.id}
                                </button>
                            ))}
                            {tables.filter(t => t.is_free && t.id !== showTransferModal.table_id).length === 0 && (
                                <div style={{ width: '100%', textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>No free tables available</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Combine Table Modal */}
            {showCombineModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', padding: '20px' }}>
                        <div className="glass modal-content" style={{ width: '100%', maxWidth: '400px', borderRadius: '32px', padding: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Combine to Table {showCombineModal.table_id}</h2>
                            <button onClick={() => setShowCombineModal(null)} style={{ background: 'var(--glass)', border: '1px solid var(--border-subtle)', width: '36px', height: '36px', borderRadius: '18px', color: 'white' }}>✕</button>
                        </div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Select another table to combine onto Table {showCombineModal.table_id}:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingBottom: '12px' }}>
                            {tables.filter(t => t.id !== showCombineModal.table_id).map(t => {
                                const isOccupied = !t.is_free;
                                return (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        combineTableWith(showCombineModal.table_id, t.id);
                                        setShowCombineModal(null);
                                    }}
                                    style={{ flex: '1 1 calc(33.333% - 12px)', padding: '16px', borderRadius: '16px', backgroundColor: isOccupied ? 'var(--accent-white)' : 'var(--glass)', border: '1px solid var(--border-subtle)', color: isOccupied ? 'var(--bg-dark)' : 'var(--text-main)', fontWeight: '700', fontSize: '1.2rem', cursor: 'pointer' }}
                                >
                                    T-{t.id}
                                </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            {/* History Detail Modal (Snackssmania Aesthetic) */}
            {selectedHistoryOrder && (
                <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', padding: '20px' }}
                    onClick={() => setSelectedHistoryOrder(null)}
                >
                    <div 
                        className="glass animate-pop" 
                        style={{ width: '100%', maxWidth: '440px', borderRadius: '32px', padding: '32px', backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '8px', letterSpacing: '-0.03em' }}>
                                    {selectedHistoryOrder?.table_id === 0 ? 'Parcel' : `Table ${selectedHistoryOrder?.table_id || '?'}`}
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', fontWeight: '600' }}>
                                    {selectedHistoryOrder?.created_at ? new Date(selectedHistoryOrder.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date Unknown'}
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedHistoryOrder(null)} 
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '20px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                            >✕</button>
                        </div>

                        {/* Items Section */}
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                                {(selectedHistoryOrder?.items || []).filter(i => i.type !== 'METADATA' && i.name && i.qty > 0).map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>{item?.qty || 0}x</span>
                                            <span style={{ fontSize: '1rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>{item?.name || 'Unknown Item'}</span>
                                        </div>
                                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: '700', color: '#fff' }}>₹{ (item?.price || 0) * (item?.qty || 0) }</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</span>
                                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff' }}>₹{selectedHistoryOrder?.total || 0}</span>
                            </div>
                        </div>

                        {/* Status Footer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', padding: '0 12px' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Payment Method</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#4f46e5' }}>{selectedHistoryOrder?.payment_method || 'Online'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Status</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981' }}>PAID</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button 
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Permanently delete this record?')) {
                                        const { error } = await supabase.from('orders').delete().eq('id', selectedHistoryOrder.id);
                                        if (error) alert(error.message);
                                        else { fetchOrders(); setSelectedHistoryOrder(null); }
                                    }
                                }}
                                style={{ flex: 1, padding: '18px', borderRadius: '18px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                Delete Order
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setInvoiceOrder(selectedHistoryOrder);
                                    setSelectedHistoryOrder(null);
                                }}
                                style={{ flex: 1.5, padding: '18px', borderRadius: '18px', backgroundColor: '#fff', color: '#000', fontWeight: '900', cursor: 'pointer', border: 'none', transition: 'all 0.2s' }}
                            >
                                View / Print Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const MemoizedTableCard = React.memo(({ table, tableOrder, hasNewOrder, isLinked, getDuration, onClick, onManualOrder }) => {
    const isOccupied = !!tableOrder;
    return (
        <div
            onClick={onClick}
            className="glass"
            style={{
                padding: '32px 24px',
                borderRadius: '24px',
                border: isLinked ? '1px dashed rgba(255,255,255,0.2)' : isOccupied ? '1px solid rgba(255,159,67,0.3)' : (hasNewOrder ? '1px solid rgba(0,201,167,0.4)' : '1px solid rgba(255,255,255,0.08)'),
                backgroundColor: isLinked ? 'rgba(255,255,255,0.03)' : isOccupied ? 'rgba(255,159,67,0.1)' : (hasNewOrder ? 'rgba(0,201,167,0.1)' : 'rgba(255,255,255,0.02)'),
                color: isOccupied && !isLinked ? '#ff9f43' : (hasNewOrder ? '#00c9a7' : '#fff'),
                cursor: (isOccupied || hasNewOrder || isLinked) ? 'pointer' : 'default',
                position: 'relative',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
        >
            <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '4px'
            }}>
                <div style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    backgroundColor: isLinked ? 'rgba(255,255,255,0.1)' : isOccupied ? 'rgba(255,159,67,0.2)' : (hasNewOrder ? 'rgba(0,201,167,0.2)' : 'rgba(255,255,255,0.05)'),
                    color: isLinked ? '#94a3b8' : isOccupied ? '#ff9f43' : (hasNewOrder ? '#00c9a7' : '#64748b')
                }}>
                    {isLinked ? 'LINKED 🔗' : isOccupied ? 'OCCUPIED' : (hasNewOrder ? 'NEW ⚡' : 'FREE')}
                </div>
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '8px', fontWeight: '900', letterSpacing: '-0.02em', color: isOccupied ? 'var(--bg-dark)' : '#fff' }}>Table {table.id}</h3>
                <p style={{ color: isOccupied ? 'rgba(0,0,0,0.6)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>{table.seats} Seats</p>

                {isOccupied && tableOrder && (
                    <div style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '800', 
                        color: 'var(--text-main)',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        padding: '6px 14px',
                        borderRadius: '14px',
                        marginTop: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        ⏱️ {getDuration(tableOrder.created_at)}
                    </div>
                )}

                {(isOccupied || hasNewOrder) ? (
                    <div style={{ marginTop: '20px', color: isOccupied ? 'rgba(0,0,0,0.8)' : '#00c9a7', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.02em', borderBottom: '2px solid' }}>
                        VIEW ORDER →
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); onManualOrder(); }}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: 'var(--glass)', border: '1px solid var(--border-subtle)', borderRadius: '14px', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                        + Manual Order
                    </button>
                )}
            </div>
        </div>
    );
});

export default AdminPage;
