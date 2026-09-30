import { motion } from 'framer-motion';
import { ArrowRight, Clock3, Compass, MapPin, Navigation, ParkingSquare, UtensilsCrossed, Hotel, Camera, Info, ChevronRight, Leaf, Trees, Car, CalendarDays, Star, TrainFront, MapPinned, Fish, Coffee, BedDouble, Minus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const navItems = ['路线', '行程', '目的地', '美食', '图集', '实用信息'];

const buildAmapLink = (keyword: string, city = '耒阳') => `https://uri.amap.com/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`;

const itinerary = [
  {
    day: 'DAY 01',
    date: '10.01',
    title: '城市与蔡伦',
    summary: '老城慢游，蔡伦纪念园与顺湖夜游。',
    nodes: [
      { time: '09:00', place: '蔡伦纪念园', stay: '1.5小时', note: '蔡侯祠、蔡子池、古法造纸文化脉络。', parking: '景区入口停车场，建议 08:30 前到达。', navText: '导航到这里', nav: buildAmapLink('蔡伦纪念园', '耒阳') },
      { time: '11:40', place: '本地午餐', stay: '1.5小时', note: '在老城区选择湘菜，体验地道味道。', parking: '老城路边/商圈停车场，国庆高峰期可停车较难。', navText: '导航到这里', nav: buildAmapLink('耒阳老城区湘菜馆', '耒阳') },
      { time: '14:00', place: '南正街 / 老城', stay: '1.5小时', note: '漫步旧街巷、街角小店和步行街氛围。', parking: '周边公共停车场，建议以现场交通组织为准。', navText: '导航到这里', nav: buildAmapLink('耒阳南正街', '耒阳') },
      { time: '16:30', place: '顺湖公园', stay: '1小时', note: '休闲散步，适合下午天色变暖后走一圈。', parking: '公园周边停车位，早到更轻松。', navText: '导航到这里', nav: buildAmapLink('顺湖公园', '耒阳') },
      { time: '19:00', place: '耒阳大舞台', stay: '2小时', note: '2026国庆晚间活动，关注节目安排与入场提示。', parking: '夜间活动附近设流动停车，出场时间以现场为准。', navText: '导航到这里', nav: buildAmapLink('耒阳大舞台', '耒阳') },
    ],
  },
  {
    day: 'DAY 02',
    date: '10.02',
    title: '一整天给竹海',
    summary: '从市区出发，深度走进蔡伦竹海。',
    nodes: [
      { time: '07:30', place: '耒阳市区出发', stay: '30分钟', note: '早出发避开国庆车流。', parking: '市区住宿附近可先停好。', navText: '导航到这里', nav: buildAmapLink('耒阳市区', '耒阳') },
      { time: '08:20', place: '蔡伦竹海', stay: '1小时', note: '先到游客中心和入口区，了解景区路线。', parking: '景区停车场，建议 08:00–09:00 到达。', navText: '导航到这里', nav: buildAmapLink('蔡伦竹海景区', '耒阳') },
      { time: '09:00', place: '观景步道', stay: '2小时', note: '从主步道走到眺望点，感受竹林和山水的尺度。', parking: '景区停车场，参考：免费。', navText: '导航到这里', nav: buildAmapLink('蔡伦竹海观景步道', '耒阳') },
      { time: '11:30', place: '竹海午餐', stay: '1小时', note: '在景区附近或返回市区前停一顿，吃本地湘味。', parking: '景区周边及停车场，国庆期间车位可能紧张。', navText: '导航到这里', nav: buildAmapLink('蔡伦竹海附近餐馆', '耒阳') },
      { time: '13:30', place: '非遗造纸与矿洞探宝', stay: '1.5小时', note: '体验古法造纸和井下探寻，适合留出慢节奏。', parking: '以当天现场交通组织为准。', navText: '导航到这里', nav: buildAmapLink('蔡伦竹海非遗体验区', '耒阳') },
      { time: '16:30', place: '返程 / 城区休整', stay: '1小时', note: '回到市区后轻松休息，不再强行安排夜游。', parking: '宿舍或酒店停放。', navText: '导航到这里', nav: buildAmapLink('耒阳市区酒店', '耒阳') },
    ],
  },
  {
    day: 'DAY 03',
    date: '10.03',
    title: '山与江',
    summary: '一早轻运动，下午在江边慢下来。',
    nodes: [
      { time: '08:30', place: '鹿岐峰森林公园', stay: '2小时', note: '适合清晨慢跑和低强度登山，空气和风景更舒服。', parking: '景区入口停车场，建议早到。', navText: '导航到这里', nav: buildAmapLink('鹿岐峰森林公园', '耒阳') },
      { time: '11:30', place: '本地午餐', stay: '1.5小时', note: '轻便午餐，避免午后过度赶路。', parking: '市区/景区附近停车位，国庆日可较拥堵。', navText: '导航到这里', nav: buildAmapLink('耒阳湘菜馆', '耒阳') },
      { time: '14:00', place: '杜甫公园', stay: '1小时', note: '安静散步，适合落地休息。', parking: '景区门口停车位，现场为准。', navText: '导航到这里', nav: buildAmapLink('杜甫公园', '耒阳') },
      { time: '15:30', place: '耒水 / 环秀楼', stay: '1.5小时', note: '江边和古建筑交汇的景色很适合拍照。', parking: '周边站点停车位，现场待定。', navText: '导航到这里', nav: buildAmapLink('耒水环境', '耒阳') },
      { time: '19:00', place: '老城晚餐', stay: '1.5小时', note: '这一晚不安排太满，吃东西和散步即可。', parking: '老城区停车场和路边，晚归可选择现场停车。', navText: '导航到这里', nav: buildAmapLink('耒阳老城区餐饮区', '耒阳') },
    ],
  },
  {
    day: 'DAY 04',
    date: '10.04',
    title: '返程日',
    summary: '不赶景点，把最后时间留给回程。',
    nodes: [
      { time: '09:00', place: '自然醒', stay: '45分钟', note: '不要赶起床，留出中段旅程缓冲。', parking: '酒店停车场。', navText: '导航到这里', nav: buildAmapLink('耒阳酒店', '耒阳') },
      { time: '09:30', place: '早餐', stay: '1小时', note: '在老城区找一处简单早餐，不要安排高峰拥堵。', parking: '酒店附近街内停车位。', navText: '导航到这里', nav: buildAmapLink('耒阳老城区早餐店', '耒阳') },
      { time: '10:30', place: '老城 / 江边散步', stay: '1小时', note: '最后一次慢步，适合喝咖啡和拍照。', parking: '街边或地面停车场。', navText: '导航到这里', nav: buildAmapLink('耒阳江边步道', '耒阳') },
      { time: '12:00', place: '午餐', stay: '1小时', note: '简单吃一顿，不再安排大行程。', parking: '城市中心停车场。', navText: '导航到这里', nav: buildAmapLink('耒阳市中心餐馆', '耒阳') },
      { time: '13:30', place: '收拾行李', stay: '45分钟', note: '提前整理，避开返程高峰。', parking: '酒店停车场。', navText: '导航到这里', nav: buildAmapLink('耒阳市区酒店', '耒阳') },
      { time: '14:00', place: '返程', stay: '按路线', note: '今天不赶景点，把最后几个小时留给返程。', parking: '出发前确认车况。', navText: '导航到这里', nav: buildAmapLink('耒阳', '耒阳') },
    ],
  },
];

const highlights = [
  { label: '旅行时长', value: '4天' },
  { label: '核心区域', value: '耒阳市区 / 近郊 / 蔡伦竹海' },
  { label: '路线特色', value: '少开车，多体验' },
  { label: '返程安排', value: '第4天为返程日' },
];

const spots = [
  {
    name: '蔡伦纪念园',
    intro: '以蔡伦造纸文化为核心的纪念与展示空间，适合用一到两小时理解耒阳历史脉络。',
    time: '1.5小时',
    open: '09:00–17:30',
    ticket: '免费/视活动而定',
    parking: '景区门口停车场，建议早到。',
    fit: ['第一次来耒阳', '喜欢历史文化', '喜欢拍照'],
    nav: buildAmapLink('蔡伦纪念园', '耒阳'),
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash' 
  },
  {
    name: '蔡伦竹海',
    intro: '耒阳最适合慢走的一处自然景区，竹林、步道、观景台和非遗体验相结合。',
    time: '半天至一天',
    open: '08:00–17:30',
    ticket: '景区门票以现场为准',
    parking: '景区停车场，参考：免费。',
    fit: ['喜欢自然', '喜欢拍照', '适合一整天慢游'],
    nav: buildAmapLink('蔡伦竹海景区', '耒阳'),
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash' 
  },
  {
    name: '鹿岐峰森林公园',
    intro: '低强度登山和林间放空的好去处，适合清晨和午前的轻度活动。',
    time: '2小时',
    open: '08:00–17:00',
    ticket: '景区门票以现场为准',
    parking: '入口停车场，建议早到。',
    fit: ['喜欢轻运动', '想看森林风景', '适合上午出发'],
    nav: buildAmapLink('鹿岐峰森林公园', '耒阳'),
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash' 
  },
  {
    name: '杜甫公园',
    intro: '城市中的静态休闲节点，适合在下午放慢脚步，看看江与树影。',
    time: '1小时',
    open: '08:00–17:30',
    ticket: '免费/视活动而定',
    parking: '公园附近停车位，现场为准。',
    fit: ['想缓慢散步', '喜欢城市景观', '适合下午出行'],
    nav: buildAmapLink('杜甫公园', '耒阳'),
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash'
  },
  {
    name: '顺湖公园',
    intro: '傍晚最适合散步的地方之一，湖面和城市夜光形成轻松氛围。',
    time: '1小时',
    open: '08:00–21:00',
    ticket: '免费',
    parking: '公园周边停车位，日间车位更充足。',
    fit: ['喜欢散步', '傍晚拍照', '城市休闲'],
    nav: buildAmapLink('顺湖公园', '耒阳'),
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash'
  },
  {
    name: '耒水 / 环秀楼',
    intro: '河水和老城的交界处，拍摄和散步都很舒服，是旅途中重要的“落地感”。',
    time: '1.5小时',
    open: '全天',
    ticket: '免费',
    parking: '周边临时停车位，现场为准。',
    fit: ['喜欢江边夜景', '慵懒散步', '拍城市实景'],
    nav: buildAmapLink('耒水环秀楼', '耒阳'),
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
    source: 'Unsplash'
  },
];

const dining = [
  {
    name: '耒阳老城湘菜馆',
    type: '湘菜 / 传统口味',
    per: '¥60–90/人',
    dishes: ['红薯粉皮', '小炒肉', '豆腐脑', '酸辣鱼'],
    location: '老城区步行街附近',
    parking: '停车位较紧，建议在商圈停车场停放。',
    hours: '10:30–21:30',
    nav: buildAmapLink('耒阳老城湘菜馆', '耒阳'),
  },
  {
    name: '新市米粉',
    type: '米粉 / 早点',
    per: '¥20–35/人',
    dishes: ['招牌米粉', '豆腐花', '油条'],
    location: '新市片区',
    parking: '街边和商圈停车位，国庆早晨较拥挤。',
    hours: '07:00–14:00',
    nav: buildAmapLink('新市米粉', '耒阳'),
  },
  {
    name: '耒阳江边小店',
    type: '轻食 / 休闲',
    per: '¥40–80/人',
    dishes: ['小吊梨汤', '面食', '甜品'],
    location: '耒水沿岸',
    parking: '江边停车位有限，以现场为准。',
    hours: '09:00–20:00',
    nav: buildAmapLink('耒阳江边美食街', '耒阳'),
  },
  {
    name: '耒阳本地农家菜',
    type: '农家菜 / 地方特色',
    per: '¥80–150/人',
    dishes: ['腊肉炖豆角', '清炒时蔬', '山野蒸菜'],
    location: '近郊或市郊',
    parking: '车位较好，适合自驾来。',
    hours: '11:00–21:00',
    nav: buildAmapLink('耒阳本地农家菜', '耒阳'),
  },
];

const hotels = [
  {
    name: '耒阳市区核心酒店（推荐落脚点）',
    location: '老城区 / 南正街 / 商圈核心区',
    price: '¥300–500 / 晚',
    parking: '酒店自有停车场或相邻公共停车场',
    distance: '距南正街约 5–10 分钟，距蔡伦纪念园约 10–15 分钟，距顺湖约 15 分钟',
    fit: ['全程不换酒店', '适合国庆车流', '适合 3 天景点集中出发'],
    nav: buildAmapLink('耒阳市区酒店', '耒阳'),
    note: '这是最稳妥的选择：第 1、3、4 天都在市区或近郊，出发和返回都省车，国庆高峰更容易停车。',
  },
  {
    name: '耒阳老城区精品酒店',
    location: '耒阳老城区步行街附近',
    price: '¥250–400 / 晚',
    parking: '周边路边停车紧张，建议提前联系酒店索取停车信息',
    distance: '步行到餐饮和夜游区很方便，去蔡伦纪念园与顺湖都较近',
    fit: ['喜欢步行吃饭', '适合第 1 天和第 4 天返程前后'],
    nav: buildAmapLink('耒阳老城区酒店', '耒阳'),
    note: '适合想把晚上吃饭和散步都放在步行范围内的人；但若想更省心，仍建议选有停车位的市区酒店。',
  },
  {
    name: '武广新城 / 商务型酒店',
    location: '武广新城附近',
    price: '¥350–600 / 晚',
    parking: '车位更稳定，适合自驾旅客',
    distance: '出发到蔡伦竹海、鹿岐峰和城市景点都比较方便，适合国庆假期出行',
    fit: ['喜欢出发和返程更省心', '希望停车条件更好', '适合带车'],
    nav: buildAmapLink('武广新城酒店', '耒阳'),
    note: '比老城区更适合带车的旅客；对 Day 2 竹海和 Day 3 鹿岐峰这样的日程更有优势。',
  },
];

const gallery = [
  { src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', alt: '耒阳竹海' },
  { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80', alt: '山林' },
  { src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80', alt: '江边' },
  { src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80', alt: '自然风景' },
  { src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80', alt: '水面晨光' },
  { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80', alt: '森林步道' },
  { src: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80', alt: '城市与江' },
  { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80', alt: '山野' },
  { src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80', alt: '竹海茶色' },
];

const mapPath = [
  [28.6884, 113.8513],
  [28.3105, 113.2221],
  [28.3957, 113.4227],
  [28.3419, 113.1543],
  [28.4508, 113.5001],
];

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function App() {
  const [activeImage, setActiveImage] = useState<number | null>(null);

  const routeMarkers = useMemo(() => [
    { label: '耒阳城区', position: [28.4169, 113.1338] },
    { label: '蔡伦竹海', position: [28.4543, 113.1514] },
    { label: '鹿岐峰', position: [28.5284, 113.2135] },
    { label: '顺湖公园', position: [28.4416, 113.1264] },
    { label: '耒水', position: [28.3917, 113.1001] },
  ], []);

  const exportPdf = () => {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;

    const drawHeader = (title: string, subtitle: string, y: number) => {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(20);
      pdf.text(title, margin, y);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.text(subtitle, pageWidth - margin - 30, y, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
    };

    const drawRow = (label: string, value: string, y: number) => {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.text(label, margin, y);
      pdf.setFont('helvetica', 'bold');
      pdf.text(value, pageWidth - margin - 42, y, { align: 'right' });
      pdf.setTextColor(0, 0, 0);
    };

    const drawCard = (x: number, y: number, w: number, h: number, title: string, body: string[]) => {
      pdf.setDrawColor(218, 214, 206);
      pdf.setFillColor(250, 248, 244);
      pdf.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');
      pdf.setFont('times', 'bold');
      pdf.setFontSize(11);
      pdf.text(title, x + 4, y + 7);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      body.forEach((line, index) => {
        pdf.text(line, x + 4, y + 15 + index * 6);
      });
    };

    pdf.setFillColor(247, 244, 239);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('2026/09/30 14:50', margin, 10);
    pdf.text('2026国庆耒阳自驾旅行攻略', pageWidth / 2, 10, { align: 'center' });

    pdf.setDrawColor(208, 204, 196);
    pdf.line(margin, 18, pageWidth - margin, 18);

    pdf.setFillColor(31, 53, 45);
    pdf.rect(margin, 26, pageWidth - margin * 2, 52, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('times', 'italic');
    pdf.setFontSize(15);
    pdf.text('在耒阳，', margin + 8, 45);
    pdf.text('过一个不赶路的国庆。', margin + 8, 53);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('10.01 — 10.04', margin + 8, 68);
    pdf.text('LEIYANG · HUNAN', pageWidth - margin - 32, 68, { align: 'right' });
    pdf.setTextColor(0, 0, 0);

    drawHeader('旅行概览', 'Travel Notes', 92);
    drawRow('旅行时长', '4天', 102);
    drawRow('核心区域', '耒阳市区 / 近郊 / 蔡伦竹海', 110);
    drawRow('路线特色', '少开车，多体验', 118);
    drawRow('返程安排', '第4天为返程日', 126);

    drawHeader('四天路线', 'Itinerary', 142);

    const days = itinerary.slice(0, 4);
    const cards = days.map((day) => ({
      title: `${day.date} ${day.title}`,
      lines: [
        `• ${day.nodes[0]?.place ?? ''}`,
        `• ${day.nodes[1]?.place ?? ''}`,
        `• ${day.nodes[2]?.place ?? ''}`,
        `• ${day.nodes[3]?.place ?? ''}`,
      ],
    }));

    const cardW = (pageWidth - margin * 2 - 8) / 2;
    const cardH = 28;
    cards.forEach((card, index) => {
      const x = margin + (index % 2) * (cardW + 8);
      const y = 150 + Math.floor(index / 2) * (cardH + 12);
      drawCard(x, y, cardW, cardH, card.title, card.lines);
    });

    pdf.addPage();

    drawHeader('重点建议', 'Notes', 18);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const tips = [
      '1. 全程住耒阳市区酒店，不需要每天换酒店，国庆车流和停车更省心。',
      '2. 竹海建议安排为“全天式一日游”，不要压缩成 1～2 小时。',
      '3. 第 4 天明确为返程日：自然醒、早餐、简单散步、午餐、收拾行李、返程。',
      '4. 景区门票、开放时间和停车以现场实际安排为准，出发前可查官方渠道。',
    ];
    tips.forEach((line, idx) => {
      pdf.text(line, margin, 30 + idx * 12);
    });

    drawHeader('住宿推荐', 'Stay', 82);
    const hotelsForPdf = hotels.slice(0, 3);
    hotelsForPdf.forEach((hotel, idx) => {
      const y = 92 + idx * 34;
      pdf.setDrawColor(224, 220, 210);
      pdf.roundedRect(margin, y, pageWidth - margin * 2, 28, 2, 2, 'S');
      pdf.setFont('times', 'bold');
      pdf.setFontSize(10.5);
      pdf.text(hotel.name, margin + 4, y + 8);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.text(`${hotel.location} / ${hotel.price} / ${hotel.parking}`, margin + 4, y + 15);
      pdf.text(`${hotel.distance}`, margin + 4, y + 22);
    });

    drawHeader('返程提醒', 'Return', 185);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const reminders = [
      '09:00 自然醒',
      '09:30 早餐',
      '10:30 老城 / 江边散步',
      '12:00 午餐',
      '13:30 收拾行李',
      '14:00 返程',
    ];
    reminders.forEach((item, idx) => {
      pdf.text(item, margin + (idx % 2) * 74, 196 + Math.floor(idx / 2) * 10);
    });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('本 PDF 为精简版旅行攻略，适合保存、分享与打印。', margin, pageHeight - 10);

    pdf.save('2026国庆耒阳自驾旅行攻略.pdf');
  };

  return (
    <div className="min-h-screen bg-paper text-ink antialiased">
      <div id="pdf-export-root" className="bg-paper">
        <header className="sticky top-0 z-50 border-b border-black/5 bg-[rgba(247,244,239,0.82)] backdrop-blur-md">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="font-serif text-xl tracking-[0.22em] text-forest">LEIYANG</div>
            </div>
            <div className="hidden items-center gap-8 text-sm font-medium text-ink/80 md:flex">
              {navItems.map((item) => (
                <a key={item} href={`#${item}`} className="transition hover:text-forest">{item}</a>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportPdf}
                className="inline-flex items-center gap-2 rounded-none border border-forest bg-transparent px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-forest transition hover:bg-[#18362f] hover:text-white"
              >
                导出 PDF
              </button>
              <button className="inline-flex items-center gap-2 rounded-none border border-forest bg-forest px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#18362f]">
                开始导航
                <ArrowRight size={14} />
              </button>
            </div>
          </nav>
        </header>

        <main>
          <section className="relative isolate overflow-hidden border-b border-black/5 bg-[#eef1ed]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-75" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1816]/80 via-[#0d1816]/45 to-[#0d1816]/20" />
            <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-end gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl text-white">
                <p className="mb-6 font-sans text-[11px] font-medium uppercase tracking-[0.38em] text-white/70">2026 · NATIONAL DAY ROAD TRIP</p>
                <h1 className="font-serif text-5xl leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-[5.3rem]">
                  在耒阳，
                  <span className="block">过一个不赶路的国庆。</span>
                </h1>
                <p className="mt-6 max-w-xl font-sans text-base text-white/80 sm:text-lg">四天假期，不跑远。以市区、近郊和蔡伦竹海为中心，留足时间吃、走、停和返程。</p>
                <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/75">
                  <span>10.01 — 10.04</span>
                  <span className="h-1 w-1 rounded-full bg-white/60" />
                  <span>LEIYANG · HUNAN</span>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="rounded-none border border-white/10 bg-[rgba(8,15,12,0.25)] p-5 text-white backdrop-blur-sm">
                <p className="font-serif text-3xl text-white">Travel Notes</p>
                <div className="mt-8 space-y-5 border-t border-white/10 pt-5">
                  {highlights.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                      <div className="text-[10px] uppercase tracking-[0.24em] text-white/60">{item.label}</div>
                      <div className="max-w-[14rem] text-sm text-white/90">{item.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          <section id="路线" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Travel overview</p>
                <h2 className="mt-4 font-serif text-4xl leading-tight text-forest sm:text-5xl">一个不赶路的国庆，
                  <span className="block">从城市中慢下来。</span>
                </h2>
              </div>
              <div className="space-y-6 text-base leading-8 text-ink/75">
                <p>耒阳适合把国庆安排得更轻一点：两三处景点、几次本地吃饭、一个不太远的竹海一日游，和一段真正放空的返程日。整个行程避免长途奔波，尽量围绕市区、近郊与蔡伦竹海来安排，让每一天都保留足够的节奏和随机感。</p>
                <p>这次旅行不追求“安排满”，而是舍弃那些需要长时间驾驶的项目，把时间留给真实走路、吃饭、停留和休息。这样更适合国庆时的车流和人流，也能更舒服地体验耒阳本身。</p>
              </div>
            </div>
          </section>

          <section id="行程" className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Itinerary</p>
                <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">四天路线</h2>
              </div>
            </div>

            <div className="grid gap-8">
              {itinerary.map((day, idx) => (
                <motion.article key={day.day} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} className="grid gap-5 border-t border-black/10 pt-8 lg:grid-cols-[140px_1fr]">
                  <div className="lg:pt-7">
                    <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-moss">{day.day}</p>
                    <p className="mt-3 font-serif text-4xl text-forest">{day.date}</p>
                    <p className="mt-2 text-lg font-medium text-ink">{day.title}</p>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {day.nodes.map((node) => (
                      <div key={`${day.day}-${node.time}`} className="group rounded-none border border-black/10 bg-[#f3efe8] p-4 transition hover:border-forest/50">
                        <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-moss">
                          <span>{node.time}</span>
                          <span>{node.stay}</span>
                        </div>
                        <div className="mb-3 flex items-center gap-3">
                          <div className="h-2.5 w-2.5 rounded-full bg-forest" />
                          <h3 className="font-serif text-2xl text-forest">{node.place}</h3>
                        </div>
                        <p className="text-sm leading-7 text-ink/75">{node.note}</p>
                        <div className="mt-5 border-t border-black/10 pt-4 text-[11px] uppercase tracking-[0.18em] text-ink/60">
                          {node.parking}
                        </div>
                        <button
                        onClick={() => window.open(node.nav, '_blank', 'noopener,noreferrer')}
                        className="mt-5 inline-flex items-center gap-2 bg-forest px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#173b34]"
                      >
                        {node.navText}
                        <Navigation size={12} />
                      </button>
                      </div>
                    ))}
                  </div>
                </motion.article>
              ))}
            </div>
          </section>

          <section id="目的地" className="border-y border-black/10 bg-[#f0efe9] py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Highlights</p>
                <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">景点精选</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {spots.map((spot) => (
                  <article key={spot.name} className="overflow-hidden border border-black/10 bg-[#f9f7f3]">
                    <img src={spot.image} alt={spot.name} className="h-64 w-full object-cover" />
                    <div className="p-5">
                      <div className="mb-3 flex items-center justify-between gap-4">
                        <h3 className="font-serif text-2xl text-forest">{spot.name}</h3>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-moss">{spot.source}</span>
                      </div>
                      <p className="text-sm leading-7 text-ink/75">{spot.intro}</p>
                      <div className="mt-5 grid gap-3 border-t border-black/10 pt-4 text-sm text-ink/70">
                        <div className="flex justify-between gap-4"><span>建议游玩</span><span>{spot.time}</span></div>
                        <div className="flex justify-between gap-4"><span>开放时间</span><span>{spot.open}</span></div>
                        <div className="flex justify-between gap-4"><span>门票</span><span>{spot.ticket}</span></div>
                        <div className="flex justify-between gap-4"><span>停车</span><span>{spot.parking}</span></div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {spot.fit.map((tag) => (
                          <span key={tag} className="border border-black/10 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-ink/70">{tag}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => window.open(spot.nav, '_blank', 'noopener,noreferrer')}
                        className="mt-6 inline-flex items-center gap-2 bg-forest px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white hover:bg-[#173b34]"
                      >
                        导航到这里
                        <MapPinned size={12} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="地图" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Route map</p>
              <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">路线地图</h2>
            </div>
            <div className="overflow-hidden border border-black/10 bg-[#f3efe8]">
              <div className="h-[420px] w-full">
                <MapContainer center={[28.42, 113.16]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Polyline positions={mapPath} pathOptions={{ color: '#1f352d', weight: 4, opacity: 0.9 }} />
                  {routeMarkers.map((marker) => (
                    <Marker key={marker.label} position={marker.position as [number, number]} icon={defaultIcon}>
                      <Popup>{marker.label}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </section>

          <section id="美食" className="border-y border-black/10 bg-[#f7f4ef] py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Food</p>
                <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">本地美食</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {dining.map((restaurant) => (
                  <article key={restaurant.name} className="border border-black/10 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-serif text-2xl text-forest">{restaurant.name}</h3>
                      <UtensilsCrossed size={18} className="text-forest" />
                    </div>
                    <div className="space-y-3 text-sm text-ink/70">
                      <div className="flex justify-between gap-4"><span>类型</span><span>{restaurant.type}</span></div>
                      <div className="flex justify-between gap-4"><span>人均</span><span>{restaurant.per}</span></div>
                      <div className="flex justify-between gap-4"><span>推荐菜</span><span>{restaurant.dishes.join('、')}</span></div>
                      <div className="flex justify-between gap-4"><span>位置</span><span>{restaurant.location}</span></div>
                      <div className="flex justify-between gap-4"><span>停车</span><span>{restaurant.parking}</span></div>
                      <div className="flex justify-between gap-4"><span>营业</span><span>{restaurant.hours}</span></div>
                    </div>
                    <button
                      onClick={() => window.open(restaurant.nav, '_blank', 'noopener,noreferrer')}
                      className="mt-5 inline-flex items-center gap-2 bg-forest px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white hover:bg-[#173b34]"
                    >
                      导航
                      <ArrowRight size={12} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="住宿" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Stay</p>
              <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">酒店</h2>
            </div>
            <div className="mb-8 rounded-none border border-black/10 bg-[#efeae1] p-5 text-sm leading-7 text-ink/75">
              推荐安排：<span className="font-medium text-forest">4 天全程住耒阳市区一家酒店，不要每天换酒店。</span> 这样更适合国庆车流，出发、停车、吃饭和返程都更省心。景点不是都必须在酒店门口，重点是每天都能在市区出发，去近郊景点的路程控制在合理范围内。
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {hotels.map((hotel) => (
                <article key={hotel.name} className="border border-black/10 bg-[#f5f1ea] p-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="font-serif text-3xl text-forest">{hotel.name}</h3>
                    <BedDouble className="text-forest" />
                  </div>
                  <div className="grid gap-3 text-sm text-ink/70">
                    <div className="flex justify-between gap-4"><span>位置</span><span>{hotel.location}</span></div>
                    <div className="flex justify-between gap-4"><span>价格区间</span><span>{hotel.price}</span></div>
                    <div className="flex justify-between gap-4"><span>停车</span><span>{hotel.parking}</span></div>
                    <div className="flex justify-between gap-4"><span>距核心区域</span><span>{hotel.distance}</span></div>
                    <div className="flex justify-between gap-4"><span>适合人群</span><span>{hotel.fit.join(' · ')}</span></div>
                  </div>
                  <div className="mt-5 rounded-none border border-black/10 bg-white p-3 text-sm leading-7 text-ink/70">
                    {hotel.note}
                  </div>
                  <button
                    onClick={() => window.open(hotel.nav, '_blank', 'noopener,noreferrer')}
                    className="mt-6 inline-flex items-center gap-2 bg-forest px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white"
                  >
                    导航到这里
                    <MapPin size={12} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section id="国庆活动" className="border-y border-black/10 bg-[#eef2ee] py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">National Day</p>
                <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">国庆活动</h2>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="border border-black/10 bg-[#f8f6f1] p-6">
                  <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-moss">活动 01</p>
                  <h3 className="mt-4 font-serif text-3xl text-forest">耒阳大舞台</h3>
                  <p className="mt-4 text-sm leading-7 text-ink/75">2026年10月1日晚间活动安排以当地官方发布为准，建议提前确认节目时间和入场方式。</p>
                  <div className="mt-6 space-y-3 text-sm text-ink/70">
                    <div className="flex justify-between gap-4"><span>时间</span><span>10月1日晚上</span></div>
                    <div className="flex justify-between gap-4"><span>地点</span><span>耒阳大舞台</span></div>
                    <div className="flex justify-between gap-4"><span>信息</span><span>截至2026年9月30日暂无官方公布信息</span></div>
                  </div>
                </div>
                <div className="border border-black/10 bg-[#f8f6f1] p-6">
                  <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-moss">活动 02</p>
                  <h3 className="mt-4 font-serif text-3xl text-forest">蔡伦竹海</h3>
                  <p className="mt-4 text-sm leading-7 text-ink/75">景区有季节性活动与文旅联动，节日期间可能出现客流控制、停车和购票调整。建议在出发前查询官方渠道。</p>
                  <div className="mt-6 space-y-3 text-sm text-ink/70">
                    <div className="flex justify-between gap-4"><span>时间</span><span>10月1日-10月4日</span></div>
                    <div className="flex justify-between gap-4"><span>地点</span><span>蔡伦竹海景区</span></div>
                    <div className="flex justify-between gap-4"><span>信息</span><span>截至2026年9月30日暂无官方公布信息</span></div>
                  </div>
                </div>
                <div className="border border-black/10 bg-[#f8f6f1] p-6">
                  <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-moss">活动 03</p>
                  <h3 className="mt-4 font-serif text-3xl text-forest">武广新城 / 非遗</h3>
                  <p className="mt-4 text-sm leading-7 text-ink/75">国庆期间非遗展示、地方文化活动和街区互动常会增加城市活动密度，适合短时参与，但不建议排满整个假期。</p>
                  <div className="mt-6 space-y-3 text-sm text-ink/70">
                    <div className="flex justify-between gap-4"><span>时间</span><span>10月1日-10月3日</span></div>
                    <div className="flex justify-between gap-4"><span>地点</span><span>武广新城 / 城区文化区</span></div>
                    <div className="flex justify-between gap-4"><span>信息</span><span>截至2026年9月30日暂无官方公布信息</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="图集" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Gallery</p>
              <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">摄影图集</h2>
            </div>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {gallery.map((image, index) => (
                <button key={index} onClick={() => setActiveImage(index)} className="group mb-4 block w-full break-inside-avoid overflow-hidden border border-black/10 bg-white text-left">
                  <img src={image.src} alt={image.alt} className="w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
                </button>
              ))}
            </div>
          </section>

          <section id="实用信息" className="border-t border-black/10 bg-[#f7f4ef] py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10">
                <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Essentials</p>
                <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">实用信息</h2>
              </div>
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="border border-black/10 bg-white p-6">
                  <div className="mb-4 flex items-center gap-3"><ParkingSquare className="text-forest" /><h3 className="font-serif text-3xl text-forest">停车</h3></div>
                  <ul className="space-y-4 text-sm leading-7 text-ink/75">
                    <li>景区入口停车场：建议 08:00–09:00 到达，早到更易停放。</li>
                    <li>老城区和商圈：国庆期间停车位紧张，建议提前规划路线。</li>
                    <li>所有停车信息以当天现场交通组织为准，不做过度承诺。</li>
                  </ul>
                </div>
                <div className="border border-black/10 bg-white p-6">
                  <div className="mb-4 flex items-center gap-3"><Clock3 className="text-forest" /><h3 className="font-serif text-3xl text-forest">开放时间 & 门票</h3></div>
                  <ul className="space-y-4 text-sm leading-7 text-ink/75">
                    <li>景区开放时间以官方公布为准，国庆期间可能调整。</li>
                    <li>门票信息以现场价格为准，不做虚构价格。</li>
                    <li>若遇到活动和交通管控，建议优先留出缓冲时间。</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="返程提醒" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="border border-black/10 bg-[#f3efe8] p-8 sm:p-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-[0.34em] text-moss">Return reminder</p>
                  <h2 className="mt-4 font-serif text-4xl text-forest sm:text-5xl">第4天是返程日</h2>
                </div>
                <div className="text-sm uppercase tracking-[0.2em] text-forest/80">今天不赶景点</div>
              </div>
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 text-base leading-8 text-ink/75">
                  <p>10月4日不再安排完整景点。睡到自然醒，慢慢吃早餐，之后在老城或江边逛一阵子，最后收拾行李并从耒阳返程。</p>
                  <p>这不是“待办清单”，而是给旅程留出余地。国庆期间最容易在返程前出现车流和停车压力，提前安排非常重要。</p>
                </div>
                <div className="border-l border-black/10 pl-0 lg:pl-8">
                  <ul className="space-y-4 text-sm text-ink/75">
                    <li>09:00 — 自然醒</li>
                    <li>09:30 — 早餐</li>
                    <li>10:30 — 老城 / 江边简单散步</li>
                    <li>12:00 — 午餐</li>
                    <li>13:30 — 收拾行李</li>
                    <li>14:00 — 返程</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-black/10 bg-[#111716] py-8 text-[#d1d9d2]">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="font-serif text-xl tracking-[0.18em] text-white">LEIYANG</div>
            <div className="flex flex-wrap gap-5 text-[11px] uppercase tracking-[0.2em] text-[#d1d9d2]/80">
              <span>路线</span>
              <span>行程</span>
              <span>美食</span>
              <span>图集</span>
              <span>实用信息</span>
            </div>
          </div>
        </footer>

        {activeImage !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d1714]/85 p-4" onClick={() => setActiveImage(null)}>
            <div className="relative max-w-5xl bg-[#f6f2eb] p-3 shadow-soft" onClick={(e) => e.stopPropagation()}>
              <img src={gallery[activeImage].src} alt={gallery[activeImage].alt} className="max-h-[80vh] w-full object-cover" />
              <button className="absolute right-4 top-4 bg-[#141d1a] px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white" onClick={() => setActiveImage(null)}>ESC</button>
              <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[11px] uppercase tracking-[0.16em] text-ink/60">
                <span>{gallery[activeImage].alt}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setActiveImage((prev) => prev === 0 ? gallery.length - 1 : (prev ?? 0) - 1)} className="border border-black/10 bg-white px-2 py-1">←</button>
                  <button onClick={() => setActiveImage((prev) => prev === gallery.length - 1 ? 0 : (prev ?? 0) + 1)} className="border border-black/10 bg-white px-2 py-1">→</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
