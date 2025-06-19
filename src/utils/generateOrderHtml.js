module.exports = function generateOrderHtml({ ordercode, ordered_at, total_price, populatedTickets, populatedProducts }) {
    const cinemaName = populatedTickets[0]?.showtime_id?.room_id?.cinema_id?.name || '';
    const address = populatedTickets[0]?.showtime_id?.room_id?.cinema_id?.address || '';
    const room = populatedTickets[0]?.showtime_id?.room_id?.name || '';
    const timeRaw = populatedTickets[0]?.showtime_id?.showtime || '';

    // Format time
    let time = '';
    if (timeRaw) {
        const d = new Date(timeRaw);
        const pad = n => n.toString().padStart(2, '0');
        time = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    const movie = populatedTickets[0]?.showtime_id?.movie_id?.title || '';
    const seats = populatedTickets.map(t => t.seat_id?.seat_name).filter(Boolean).join(', ');

    return `
    <html>
    <head>
        <meta charset="utf-8" />
        <style>
            body {
                font-family: 'Segoe UI', Arial, sans-serif;
                margin: 0;
                padding: 0;
                background: #fff9ed;
            }
            .card-container {
                padding: 20px;
            }
            .ticket-card {
                width: 100%;
                border: 2px solid black;
                border-radius: 10px;
                display: flex;
                overflow: hidden;
            }
            .ticket-left {
                flex: 2;
                padding: 14px 18px;
                display: flex;
                flex-direction: column;
                justify-content: start;
            }
            .ticket-middle {
                flex: 1.4;
                padding: 14px 18px;
                border-left: 2px dashed #484848;
                display: flex;
                flex-direction: column;
            }
            .ticket-right {
                width: 70px;
                min-width: 70px;
                background: #fdf0f0;
                border-left: 2px dashed #484848;
                display: flex;
                align-items: center;
                justify-content: center;
                writing-mode: vertical-rl;
                text-orientation: mixed;
                font-size: 1.8rem;
                font-weight: bold;
                color: #484848;
                padding: 6px 0;
                letter-spacing: 2px;
            }
            .ticket-title {
                font-size: 1.6rem;
                font-weight: 700;
                color: #333;
                margin-bottom: 24px;
            }
            .ticket-info {
                font-size: 1rem;
                margin-bottom: 6px;
                color: #222;
            }
            .ticket-label {
                font-weight: 600;
                color: #222;
            }
            .ticket-section {
                margin-bottom: 10px;
            }
            .ticket-products {
                margin: 4px 0 0 16px;
                padding: 0;
                list-style: disc;
                color: #222;
            }
            .ticket-products li {
                font-size: 0.85rem;
                margin-bottom: 3px;
            }
            .ticket-footer {
                margin-top: auto;
                font-size: 0.85rem;
                font-style: italic;
                color: #444;
                text-align: right;
                margin-top: 16px;
            }
            .showtime-seats {
                border-bottom: 1px dashed #484848;
                padding-bottom: 8px;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="card-container">
            <div class="ticket-card">
                <div class="ticket-left">
                    <div class="ticket-title">HÓA ĐƠN ĐẶT VÉ</div>
                    <div class="ticket-info"><span class="ticket-label">Ngày đặt:</span> ${ordered_at}</div>
                    <div class="ticket-info"><span class="ticket-label">Tổng tiền:</span> ${total_price} VND</div>
                    <div class="ticket-section">
                        <div class="ticket-info"><span class="ticket-label">Rạp:</span> ${cinemaName}</div>
                        <div class="ticket-info"><span class="ticket-label">Địa chỉ:</span> ${address}</div>
                    </div>
                </div>
                <div class="ticket-middle">
                    <div class="showtime-seats">
                        <div class="ticket-info"><span class="ticket-label">Phim:</span> ${movie}</div>
                        <div class="ticket-info"><span class="ticket-label">Phòng:</span> ${room}</div>
                        <div class="ticket-info"><span class="ticket-label">Suất chiếu:</span> ${time}</div>
                        <div class="ticket-info"><span class="ticket-label">Ghế:</span> ${seats || 'Không có'}</div>
                    </div>
                    <div class="ticket-label" style="font-size:1.05rem; margin-bottom:6px;">Sản phẩm</div>
                    <ul class="ticket-products">
                        ${
                            populatedProducts.length > 0
                                ? populatedProducts.map(p => `<li>${p.product_id?.name} x${p.quantity}</li>`).join('')
                                : '<li>Không có</li>'
                        }
                    </ul>
                    <div class="ticket-footer">Chúc bạn xem phim vui vẻ!</div>
                </div>
                <div class="ticket-right">
                    ${ordercode}
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};
