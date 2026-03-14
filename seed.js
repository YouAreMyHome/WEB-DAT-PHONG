/**
 * seed.js — Tạo dataset mẫu cho database staynight
 * Chạy: node seed.js
 * Ảnh lấy từ nguồn công khai: Unsplash (https://unsplash.com/license)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Models ────────────────────────────────────────────────────────────────────
const User    = require('./models/User');
const Hotel   = require('./models/Hotel');
const Room    = require('./models/Room');
const Booking = require('./models/Booking');
const Rate    = require('./models/Rate');
const Favorite = require('./models/Favorite');

// ── Ảnh công khai (Unsplash) ──────────────────────────────────────────────────
const HOTEL_IMGS = [
  [ // Hà Nội
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
  ],
  [ // Hồ Chí Minh
    'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80',
    'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=800&q=80',
  ],
  [ // Đà Nẵng
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80',
  ],
  [ // Nha Trang
    'https://images.unsplash.com/photo-1477120128765-a0528148fed6?w=800&q=80',
    'https://images.unsplash.com/photo-1520637836862-4d197d17c36a?w=800&q=80',
    'https://images.unsplash.com/photo-1506059612708-99d6c258160e?w=800&q=80',
  ],
  [ // Hội An
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80',
    'https://images.unsplash.com/photo-1590664863685-a99ef05e9f61?w=800&q=80',
  ],
  [ // Phú Quốc
    'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80',
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  ],
];

const ROOM_IMGS = {
  standard: [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
  ],
  vip: [
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
  ],
};

// ── Dữ liệu khách sạn ─────────────────────────────────────────────────────────
const HOTELS_DATA = [
  {
    name: 'Hà Nội Grand Hotel',
    location: 'Hà Nội',
    description: 'Khách sạn 5 sao sang trọng tại trung tâm Hà Nội, gần Hồ Hoàn Kiếm và Phố cổ.',
    stars: 5,
  },
  {
    name: 'Sài Gòn Palace Hotel',
    location: 'Hồ Chí Minh',
    description: 'Khách sạn cao cấp nằm tại trung tâm Quận 1, Thành phố Hồ Chí Minh.',
    stars: 4,
  },
  {
    name: 'Đà Nẵng Beach Resort',
    location: 'Đà Nẵng',
    description: 'Khu nghỉ dưỡng ven biển tuyệt đẹp tại Mỹ Khê, Đà Nẵng с view biển tuyệt đỉnh.',
    stars: 5,
  },
  {
    name: 'Nha Trang Ocean Hotel',
    location: 'Nha Trang',
    description: 'Khách sạn hướng biển Nha Trang với hồ bơi vô cực và nhà hàng hải sản tươi sống.',
    stars: 4,
  },
  {
    name: 'Hội An Heritage Boutique',
    location: 'Hội An',
    description: 'Khách sạn boutique phong cách cổ điển Hội An, cách phố cổ UNESCO 5 phút đi bộ.',
    stars: 4,
  },
  {
    name: 'Phú Quốc Paradise Resort',
    location: 'Phú Quốc',
    description: 'Khu nghỉ dưỡng hạng sang tại Phú Quốc với bãi biển riêng và villa nhiệt đới.',
    stars: 5,
  },
];

// ── Loại phòng & giá ──────────────────────────────────────────────────────────
const ROOM_TYPES = [
  { type: 'Phòng thường 1 giường lớn',  basePrice: 500000,  imgKey: 'standard' },
  { type: 'Phòng thường 2 giường nhỏ',  basePrice: 600000,  imgKey: 'standard' },
  { type: 'Phòng vip 1 giường lớn',     basePrice: 1200000, imgKey: 'vip' },
  { type: 'Phòng vip 2 giường nhỏ',     basePrice: 1500000, imgKey: 'vip' },
];

// ── Hàm tiện ích ──────────────────────────────────────────────────────────────
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randItem = (arr) => arr[randInt(0, arr.length - 1)];
const daysOffset = (d) => new Date(Date.now() + d * 86400000);
const orderId = () => 'ORD' + Date.now() + randInt(100, 999);

const COMMENTS = [
  'Phòng rất sạch sẽ, nhân viên thân thiện, chắc chắn sẽ quay lại!',
  'Vị trí đắc địa, view đẹp, dịch vụ tốt.',
  'Bữa sáng ngon, phòng thoáng mát. Rất hài lòng.',
  'Khách sạn hiện đại, tiện nghi đầy đủ, xứng đáng mức giá.',
  'Nhân viên nhiệt tình, checkin nhanh. Sẽ giới thiệu cho bạn bè.',
  'Phòng rộng, view biển đẹp, hồ bơi tuyệt vời.',
  'Tốt nhưng âm thanh hơi ồn vào ban đêm.',
  'Bữa sáng buffet phong phú, wifi ổn định.',
  'Lobby sang trọng, phòng sạch và thơm.',
  'Dịch vụ spa tốt, bể bơi sạch, rất thư giãn.',
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✔ Kết nối database:', mongoose.connection.db.databaseName);

  // Xoá dữ liệu cũ
  await Promise.all([
    User.deleteMany({}),
    Hotel.deleteMany({}),
    Room.deleteMany({}),
    Booking.deleteMany({}),
    Rate.deleteMany({}),
    Favorite.deleteMany({}),
  ]);
  console.log('✔ Đã xoá dữ liệu cũ');

  // ── 1. Users ────────────────────────────────────────────────────────────────
  const hashPwd = async (p) => bcrypt.hash(p, 10);

  // User.create() kích hoạt pre-save hook → để hook tự hash, không pre-hash ở đây
  const adminUser = await User.create({
    name: 'Admin StayNight',
    email: 'admin@staynight.vn',
    password: 'Admin@123',
    role: 'Admin',
    isVerified: true,
    age: 30,
    avatar: 'https://i.pravatar.cc/150?img=1',
  });

  const managers = await User.insertMany([
    { name: 'Nguyễn Văn Hùng',  email: 'manager1@staynight.vn', password: 'Manager@123', role: 'HotelManager', isVerified: true, age: 35, avatar: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Trần Thị Mai',     email: 'manager2@staynight.vn', password: 'Manager@123', role: 'HotelManager', isVerified: true, age: 32, avatar: 'https://i.pravatar.cc/150?img=12' },
    { name: 'Lê Minh Khoa',     email: 'manager3@staynight.vn', password: 'Manager@123', role: 'HotelManager', isVerified: true, age: 40, avatar: 'https://i.pravatar.cc/150?img=13' },
    { name: 'Phạm Quỳnh Anh',   email: 'manager4@staynight.vn', password: 'Manager@123', role: 'HotelManager', isVerified: true, age: 38, avatar: 'https://i.pravatar.cc/150?img=14' },
    { name: 'Hoàng Đức Tài',    email: 'manager5@staynight.vn', password: 'Manager@123', role: 'HotelManager', isVerified: true, age: 45, avatar: 'https://i.pravatar.cc/150?img=15' },
    { name: 'Vũ Thanh Hà',      email: 'manager6@staynight.vn', password: 'Manager@123', role: 'HotelManager', isVerified: true, age: 36, avatar: 'https://i.pravatar.cc/150?img=16' },
  ]);

  const CUSTOMER_DATA = [
    { name: 'Nguyễn Thị Lan',    email: 'lan@gmail.com',    age: 25, img: 21 },
    { name: 'Trần Văn Bình',     email: 'binh@gmail.com',   age: 28, img: 22 },
    { name: 'Lê Thị Hoa',        email: 'hoa@gmail.com',    age: 22, img: 23 },
    { name: 'Phạm Đức Nam',      email: 'nam@gmail.com',    age: 31, img: 24 },
    { name: 'Hoàng Thị Thu',     email: 'thu@gmail.com',    age: 27, img: 25 },
    { name: 'Đỗ Văn Tùng',       email: 'tung@gmail.com',   age: 33, img: 26 },
    { name: 'Ngô Thị Hương',     email: 'huong@gmail.com',  age: 24, img: 27 },
    { name: 'Bùi Văn Đức',       email: 'duc@gmail.com',    age: 29, img: 28 },
    { name: 'Dương Thị Ngọc',    email: 'ngoc@gmail.com',   age: 26, img: 29 },
    { name: 'Lý Văn Phúc',       email: 'phuc@gmail.com',   age: 34, img: 30 },
    { name: 'Võ Thị Kim',        email: 'kim@gmail.com',    age: 23, img: 31 },
    { name: 'Đinh Văn Long',     email: 'long@gmail.com',   age: 30, img: 32 },
  ];

  const customers = await User.insertMany(
    await Promise.all(CUSTOMER_DATA.map(async (c) => ({
      name: c.name,
      email: c.email,
      password: 'Customer@123', // Mật khẩu chung cho khách hàng
      role: 'Customer',
      isVerified: true,
      age: c.age,
      avatar: `https://i.pravatar.cc/150?img=${c.img}`,
    })))
  );

  console.log(`✔ Tạo ${1 + managers.length + customers.length} users`);

  // ── 2. Hotels & Rooms ───────────────────────────────────────────────────────
  const hotels = [];
  const allRooms = [];

  const starMultiplier = [1, 1, 1.2, 1.3, 1.4, 1.5];

  for (let i = 0; i < HOTELS_DATA.length; i++) {
    const hotel = await Hotel.create({
      name: HOTELS_DATA[i].name,
      location: HOTELS_DATA[i].location,
      description: HOTELS_DATA[i].description,
      stars: HOTELS_DATA[i].stars,
      manager: managers[i]._id,
      imagehotel: HOTEL_IMGS[i],
      rooms: [],
    });

    const mult = starMultiplier[i];
    const roomDocs = [];

    for (const rt of ROOM_TYPES) {
      const count = randInt(2, 4);
      for (let r = 0; r < count; r++) {
        const room = await Room.create({
          hotel: hotel._id,
          type: rt.type,
          price: Math.round(rt.basePrice * mult / 1000) * 1000,
          availability: Math.random() > 0.2,
          imageroom: ROOM_IMGS[rt.imgKey],
        });
        roomDocs.push(room);
        allRooms.push(room);
      }
    }

    hotel.rooms = roomDocs.map((r) => r._id);
    await hotel.save();
    hotels.push(hotel);
  }

  console.log(`✔ Tạo ${hotels.length} hotels, ${allRooms.length} rooms`);

  // ── 3. Bookings ─────────────────────────────────────────────────────────────
  const STATUSES = ['Pending', 'Complete', 'CheckIn', 'Done'];
  const bookings = [];

  for (let i = 0; i < 30; i++) {
    const customer = randItem(customers);
    const room = randItem(allRooms);
    const checkIn  = daysOffset(randInt(-30, 30));
    const checkOut = new Date(checkIn.getTime() + randInt(1, 7) * 86400000);
    const nights   = Math.round((checkOut - checkIn) / 86400000);

    const booking = await Booking.create({
      user: customer._id,
      room: room._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      phoneBooking: `09${randInt(10000000, 99999999)}`,
      emailBooking: customer.email,
      paymentStatus: randItem(STATUSES),
      orderId: orderId(),
      priceBooking: room.price * nights,
    });
    bookings.push(booking);
  }

  console.log(`✔ Tạo ${bookings.length} bookings`);

  // ── 4. Rates ────────────────────────────────────────────────────────────────
  const ratedPairs = new Set();
  let rateCount = 0;

  for (let i = 0; i < 40; i++) {
    const customer = randItem(customers);
    const hotel = randItem(hotels);
    const key = `${customer._id}_${hotel._id}`;
    if (ratedPairs.has(key)) continue;
    ratedPairs.add(key);

    await Rate.create({
      hotel: hotel._id,
      user: customer._id,
      rating: randInt(6, 10),
      comment: randItem(COMMENTS),
      date: daysOffset(randInt(-60, 0)),
    });
    rateCount++;
  }

  console.log(`✔ Tạo ${rateCount} rates`);

  // ── 5. Favorites ────────────────────────────────────────────────────────────
  const favPairs = new Set();
  let favCount = 0;

  for (let i = 0; i < 25; i++) {
    const customer = randItem(customers);
    const hotel = randItem(hotels);
    const key = `${customer._id}_${hotel._id}`;
    if (favPairs.has(key)) continue;
    favPairs.add(key);

    await Favorite.create({
      userId: customer._id,
      hotelId: hotel._id,
    });
    favCount++;
  }

  console.log(`✔ Tạo ${favCount} favorites`);

  // ── Tóm tắt ─────────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log('  SEED HOÀN TẤT — database:', mongoose.connection.db.databaseName);
  console.log('══════════════════════════════════════════');
  console.log('  Admin     : admin@staynight.vn / Admin@123');
  console.log('  Manager   : manager1@staynight.vn / Manager@123');
  console.log('  Customer  : lan@gmail.com / Customer@123');
  console.log('══════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed thất bại:', err);
  process.exit(1);
});
