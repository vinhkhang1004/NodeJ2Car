import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CompareContext } from '../context/CompareContext';
import { CartContext } from '../context/CartContext';
import { getFileUrl } from '../lib/utils';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Trash2, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import Rating from '../components/Rating';

const Compare = () => {
  const { compareItems, removeFromCompare, clearCompare } = useContext(CompareContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Selected vehicle state for compatibility check
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('2020');

  // List of brands/models extracted from database compatibilities to offer smart selections
  const [availableVehicles, setAvailableVehicles] = useState({ brands: [], models: {} });

  useEffect(() => {
    // Collect all available vehicle brands and models from the items being compared
    const brands = new Set();
    const modelsByBrand = {};

    compareItems.forEach(item => {
      item.carCompatibilities?.forEach(compat => {
        if (compat.carBrand) {
          brands.add(compat.carBrand);
          if (!modelsByBrand[compat.carBrand]) {
            modelsByBrand[compat.carBrand] = new Set();
          }
          if (compat.carModel) {
            modelsByBrand[compat.carBrand].add(compat.carModel);
          }
        }
      });
    });

    const uniqueBrands = Array.from(brands);
    const uniqueModels = {};
    Object.keys(modelsByBrand).forEach(b => {
      uniqueModels[b] = Array.from(modelsByBrand[b]);
    });

    setAvailableVehicles({
      brands: uniqueBrands.length > 0 ? uniqueBrands : ['Toyota', 'BMW', 'Honda', 'Mercedes-Benz', 'Hyundai', 'Ford'],
      models: uniqueBrands.length > 0 ? uniqueModels : {
        'Toyota': ['Camry', 'Corolla', 'Vios', 'Fortuner'],
        'BMW': ['3 Series', '5 Series', 'X5'],
        'Honda': ['Civic', 'CR-V', 'City'],
        'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC'],
        'Hyundai': ['Santa Fe', 'Tucson', 'Elantra'],
        'Ford': ['Ranger', 'Everest', 'Explorer']
      }
    });

    // Auto-select first brand and model if available
    if (uniqueBrands.length > 0) {
      setSelectedBrand(uniqueBrands[0]);
      if (uniqueModels[uniqueBrands[0]]?.length > 0) {
        setSelectedModel(uniqueModels[uniqueBrands[0]][0]);
      }
    }
  }, [compareItems]);

  const handleBrandChange = (e) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    const models = availableVehicles.models[brand] || [];
    setSelectedModel(models.length > 0 ? models[0] : '');
  };

  // Helper to retrieve technical specifications based on name and category
  const getSpecs = (part) => {
    const catName = typeof part.category === 'object' ? part.category?.name : (part.category || '');
    const brand = part.brand || '';
    const name = part.name || '';
    
    const defaultSpecs = {
      'Chất liệu': 'Hợp kim thép chịu lực cao',
      'Kích thước': 'Chuẩn kích thước OEM',
      'Trọng lượng': 'Tiêu chuẩn',
      'Tiêu chuẩn kiểm định': 'ISO 9001 / TS 16949'
    };

    if (catName.includes('Động cơ') || catName.includes('Động Cơ') || name.toLowerCase().includes('lọc') || name.toLowerCase().includes('curoa') || name.toLowerCase().includes('bugi') || name.toLowerCase().includes('ắc quy') || name.toLowerCase().includes('van hằng nhiệt')) {
      if (name.toLowerCase().includes('bugi')) {
        return {
          'Loại bugi': 'Iridium / Bạch kim kép',
          'Đường kính ren': '14mm',
          'Khoảng cách đánh lửa': '1.1mm',
          'Tuổi thọ khuyến nghị': '80.000 - 100.000 km',
          'Độ bền nhiệt': 'Rất cao (Lớp cách điện gốm alumina)'
        };
      }
      if (name.toLowerCase().includes('lọc dầu') || name.toLowerCase().includes('oil filter')) {
        return {
          'Vật liệu lọc': 'Giấy tổng hợp xếp nếp xếp mật độ cao',
          'Van một chiều': 'Van silicone chống chảy ngược',
          'Van an toàn mở tại': '2.0 bar',
          'Chu kỳ thay thế': '8.000 - 10.000 km',
          'Khả năng lọc sạch': '99% tạp chất kích thước > 20 micron'
        };
      }
      if (name.toLowerCase().includes('lọc gió') || name.toLowerCase().includes('air filter')) {
        return {
          'Vật liệu lọc': 'Sợi bông tẩm dầu chuyên dụng',
          'Khả năng tái sử dụng': 'Có thể rửa sạch & dùng lại nhiều lần',
          'Lưu lượng không khí': 'Tăng 30-40% so với lọc giấy thường',
          'Chu kỳ vệ sinh': '15.000 - 20.000 km',
          'Khung viền': 'Cao su dẻo chịu nhiệt polyurethane'
        };
      }
      if (name.toLowerCase().includes('curoa') || name.toLowerCase().includes('belt')) {
        return {
          'Chất liệu': 'Cao su EPDM gia cường sợi aramid siêu dai',
          'Số rãnh (ribs)': '6 rãnh tiêu chuẩn (6PK)',
          'Khả năng chịu nhiệt': '-40°C đến 130°C',
          'Độ giãn nở': 'Hầu như không giãn trong suốt vòng đời',
          'Chu kỳ thay thế': '80.000 - 100.000 km'
        };
      }
      if (name.toLowerCase().includes('ắc quy') || name.toLowerCase().includes('battery')) {
        return {
          'Công nghệ': 'AGM (Absorbent Glass Mat) khô cao cấp',
          'Dung lượng bình': '70 Ah',
          'Dòng khởi động lạnh (CCA)': '760 A',
          'Điện áp ra': '12V',
          'Tuổi thọ trung bình': '4 - 5 năm (không cần bảo dưỡng)'
        };
      }
      if (name.toLowerCase().includes('van hằng nhiệt') || name.toLowerCase().includes('thermostat')) {
        return {
          'Nhiệt độ mở van': '82°C (Khởi đầu) - 95°C (Mở hoàn toàn)',
          'Vật liệu thân': 'Đồng thau nguyên khối & Thép không gỉ',
          'Gioăng đệm': 'Cao su nitrile chịu dầu nhiệt',
          'Thời gian phản hồi': '< 5 giây khi đạt nhiệt độ kích hoạt'
        };
      }
      if (name.toLowerCase().includes('nước làm mát') || name.toLowerCase().includes('coolant')) {
        return {
          'Công nghệ pha trộn': 'OAT (Organic Acid Technology) đậm đặc',
          'Nhiệt độ đóng băng': '-37°C',
          'Nhiệt độ sôi': '136°C (tại áp suất bình thường)',
          'Thành phần bảo vệ': 'Không chứa silicate, borate, amine',
          'Thời gian sử dụng': '5 năm hoặc 250.000 km'
        };
      }
    }

    if (catName.includes('Phanh') || catName.includes('Treo') || name.toLowerCase().includes('phanh') || name.toLowerCase().includes('rô-tuyn') || name.toLowerCase().includes('càng') || name.toLowerCase().includes('stabilizer') || name.toLowerCase().includes('arm')) {
      if (name.toLowerCase().includes('càng') || name.toLowerCase().includes('arm')) {
        return {
          'Vật liệu chế tạo': 'Hợp kim nhôm hàng không 6082-T6 siêu nhẹ',
          'Cao su đệm (Bushing)': 'Cao su tự nhiên giảm chấn chịu lực xoắn lớn',
          'Khớp cầu (Ball Joint)': 'Hợp kim crom-moly bọc teflon tự bôi trơn',
          'Trọng lượng': brand.toLowerCase().includes('meyle') ? '3.1 kg (Tăng cứng cốt thép)' : '2.8 kg (Tối ưu trọng lượng)',
          'Xử lý bề mặt': 'Sơn tĩnh điện chống ăn mòn muối biển'
        };
      }
      if (name.toLowerCase().includes('rô-tuyn') || name.toLowerCase().includes('stabilizer') || name.toLowerCase().includes('link')) {
        return {
          'Chất liệu trục ball': 'Thép hợp kim tôi cứng nhiệt luyện cường độ cao',
          'Chất liệu vỏ bọc cát': 'Cao su tổng hợp CR chống nứt vỡ rách',
          'Độ chịu tải lực kéo': 'Lên đến 15.000 N',
          'Bôi trơn bên trong': 'Mỡ gốc Lithium chịu áp suất cực cao',
          'Chu kỳ kiểm tra': 'Mỗi 20.000 km hoặc khi bảo dưỡng gầm'
        };
      }
      if (name.toLowerCase().includes('pads') || name.toLowerCase().includes('má phanh')) {
        return {
          'Chất liệu ma sát': 'Hợp chất gốm carbon ít bụi (Low-dust Ceramic)',
          'Hệ số ma sát (Mu)': '0.40 - 0.45μ (Ổn định mọi dải nhiệt)',
          'Nhiệt độ hoạt động': 'Kháng quá nhiệt lên đến 600°C',
          'Tấm đệm chống ồn': 'Tấm đệm kim loại đa lớp dán sẵn',
          'Độ mài mòn đĩa': 'Rất thấp (kéo dài tuổi thọ đĩa phanh)'
        };
      }
    }

    return defaultSpecs;
  };

  // Helper to format origin based on brand
  const getOrigin = (brand) => {
    const b = brand?.toLowerCase() || '';
    if (b.includes('bosch') || b.includes('meyle') || b.includes('lemforder') || b.includes('mann')) return 'Đức (Germany)';
    if (b.includes('555') || b.includes('ngk') || b.includes('denso')) return 'Nhật Bản (Japan)';
    if (b.includes('ctr') || b.includes('hyundai') || b.includes('kia')) return 'Hàn Quốc (Korea)';
    if (b.includes('brembo') || b.includes('magneti')) return 'Ý (Italy)';
    if (b.includes('motul') || b.includes('valeo')) return 'Pháp (France)';
    if (b.includes('gates') || b.includes('k&n') || b.includes('mobil')) return 'Mỹ (USA)';
    return 'Chính hãng OEM';
  };

  // Helper to get warranty based on part type
  const getWarranty = (part) => {
    if (part.partType === 'OEM') return '24 tháng (Chính hãng)';
    if (part.partType === 'OES') return '18 tháng';
    return '12 tháng';
  };

  // Check if a part is compatible with selected car
  const checkCompatibility = (part) => {
    if (!selectedBrand || !selectedModel) return { status: 'unknown', text: 'Chưa chọn xe' };
    
    const isCompatible = part.carCompatibilities?.some(compat => 
      compat.carBrand.toLowerCase() === selectedBrand.toLowerCase() &&
      compat.carModel.toLowerCase() === selectedModel.toLowerCase() &&
      (!selectedYear || Number(compat.carYear) === Number(selectedYear))
    );

    if (isCompatible) {
      return { status: 'yes', text: 'Tương thích 100%' };
    }
    return { status: 'no', text: 'Không tương thích' };
  };

  // Highlight lowest price
  const getLowestPriceId = () => {
    if (compareItems.length === 0) return null;
    let lowest = compareItems[0];
    compareItems.forEach(item => {
      if (item.price < lowest.price) {
        lowest = item;
      }
    });
    return lowest._id;
  };

  const lowestPriceId = getLowestPriceId();

  // AI advisory generation
  const renderAIRecommendation = () => {
    if (compareItems.length < 2) return null;

    // Find cheapest
    const cheapest = [...compareItems].sort((a, b) => a.price - b.price)[0];
    
    // Find highest performance (OEM or higher price)
    const oemOes = compareItems.filter(item => item.partType === 'OEM' || item.partType === 'OES');
    const bestPerf = oemOes.length > 0 
      ? oemOes.sort((a, b) => b.price - a.price)[0] 
      : [...compareItems].sort((a, b) => b.price - a.price)[0];

    const cheapestVnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cheapest.price);

    // Compat check summary
    const compatSummary = [];
    if (selectedBrand && selectedModel) {
      compareItems.forEach(item => {
        const isCompat = item.carCompatibilities?.some(compat => 
          compat.carBrand.toLowerCase() === selectedBrand.toLowerCase() &&
          compat.carModel.toLowerCase() === selectedModel.toLowerCase() &&
          Number(compat.carYear) === Number(selectedYear)
        );
        compatSummary.push({ name: item.name, isCompat });
      });
    }

    return (
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-blue-950 dark:text-white uppercase tracking-widest">
              Đánh giá & Gợi ý từ Trợ lý Kỹ thuật J2Car
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Phân tích chuyên sâu dựa trên dòng xe và chất lượng vật liệu
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          <p>
            🔥 <strong>Về hiệu năng & chất lượng chế tạo tốt nhất:</strong> Tôi khuyên dùng{' '}
            <span className="text-blue-950 dark:text-white font-bold">{bestPerf.name} ({bestPerf.brand})</span>. 
            Đây là dòng sản phẩm phân loại <span className="text-orange-500 font-black">{bestPerf.partType}</span> chất lượng cao, 
            sử dụng các vật liệu cải tiến vượt trội (như hợp kim hàng không hoặc cao su tự nhiên giảm rung chấn) giúp hệ thống hoạt động 
            bền bỉ, an toàn trong thời tiết khắc nghiệt và đạt hiệu suất tối đa.
          </p>

          <p>
            💰 <strong>Về ngân sách & chi phí tối ưu (Ngon-Bổ-Rẻ):</strong> Sản phẩm{' '}
            <span className="text-blue-950 dark:text-white font-bold">{cheapest.name} ({cheapest.brand})</span> là lựa chọn 
            kinh tế nhất với giá bán chỉ <span className="text-emerald-600 font-black">{cheapestVnd}</span>. 
            Mặc dù thuộc phân khúc giá rẻ hơn, sản phẩm chuẩn <span className="text-slate-500 font-bold">{cheapest.partType}</span> vẫn 
            được bảo hành chính hãng đầy đủ và đáp ứng tốt 100% nhu cầu lái xe thông thường của bạn.
          </p>

          {selectedBrand && selectedModel && (
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 space-y-2">
              <span className="text-[10px] font-black text-blue-950 dark:text-white uppercase tracking-widest block mb-2">
                Kiểm tra tương thích cho xe {selectedBrand} {selectedModel} ({selectedYear}):
              </span>
              <ul className="space-y-2">
                {compatSummary.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs font-bold">
                    {item.isCompat ? (
                      <>
                        <span className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                          <Check size={12} />
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {item.name}: <span className="text-emerald-600 font-black">Lắp vừa khớp nguyên bản.</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-5 h-5 bg-red-50 text-red-500 rounded-full flex items-center justify-center shrink-0">
                          <AlertTriangle size={12} />
                        </span>
                        <span className="text-slate-700 dark:text-slate-300">
                          {item.name}: <span className="text-red-500 font-black">Không tương thích theo dữ liệu xe đã chọn.</span> Vui lòng kiểm tra lại số VIN của xe.
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Find all unique specs keys among compared products to form table rows
  const allSpecsKeys = new Set();
  compareItems.forEach(item => {
    Object.keys(getSpecs(item)).forEach(key => allSpecsKeys.add(key));
  });
  const specsRows = Array.from(allSpecsKeys);

  if (compareItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-300">
          <HelpCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-blue-950 dark:text-white uppercase tracking-tighter">
          Danh sách so sánh trống
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">
          Vui lòng quay lại cửa hàng và chọn từ 2 đến 4 phụ tùng cùng danh mục để tiến hành so sánh đối chiếu kỹ thuật.
        </p>
        <button 
          onClick={() => navigate('/shop')}
          className="inline-flex items-center gap-2 py-4 px-8 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-orange-500/20 rounded-sm"
        >
          <ArrowLeft size={16} /> Quay lại cửa hàng
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 pb-24">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-8">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
          <Link to="/" className="hover:text-blue-950 dark:hover:text-white transition-colors">Trang Chủ</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-blue-950 dark:hover:text-white transition-colors">Cửa hàng</Link>
          <span>/</span>
          <span className="text-blue-950 dark:text-white">So sánh sản phẩm</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-blue-950 dark:text-white leading-tight tracking-tighter uppercase mb-2">
              So sánh phụ tùng
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Đối chiếu trực quan thông số kỹ thuật, xuất xứ, độ tương thích và chính sách của các hãng phụ tùng hàng đầu.
            </p>
          </div>
          <button 
            onClick={clearCompare}
            className="py-3 px-6 bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 dark:bg-slate-900 dark:text-slate-400 text-xs font-black uppercase tracking-widest rounded-sm transition-all flex items-center gap-2"
          >
            <Trash2 size={14} /> Xóa tất cả
          </button>
        </div>
      </div>

      {/* Vehicle Compatibility Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-10">
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-6 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h4 className="text-xs font-black text-blue-950 dark:text-white uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="text-orange-500 animate-pulse" size={16} /> Kiểm tra tương thích theo xe
            </h4>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Chọn xe của bạn để hệ thống tự động kiểm duyệt khả năng lắp đặt
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Brand */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Hãng Xe</label>
              <select 
                value={selectedBrand} 
                onChange={handleBrandChange}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-950 dark:text-white px-3 py-2.5 rounded-sm focus:outline-none min-w-[140px]"
              >
                <option value="">-- Chọn hãng --</option>
                {availableVehicles.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Dòng Xe</label>
              <select 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedBrand}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-950 dark:text-white px-3 py-2.5 rounded-sm focus:outline-none min-w-[140px] disabled:opacity-50"
              >
                <option value="">-- Chọn dòng --</option>
                {(availableVehicles.models[selectedBrand] || []).map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Năm sản xuất</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-blue-950 dark:text-white px-3 py-2.5 rounded-sm focus:outline-none min-w-[100px]"
              >
                {['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 overflow-x-auto mb-16 scrollbar-thin">
        <table className="w-full border-collapse border-spacing-0 table-fixed min-w-[800px]">
          <thead>
            <tr>
              {/* Criteria column */}
              <th className="w-1/5 bg-slate-50 dark:bg-slate-900/20 text-left p-6 text-[10px] font-black text-blue-950 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-slate-850">
                Tiêu Chí So Sánh
              </th>
              {/* Product columns */}
              {compareItems.map(item => (
                <th key={item._id} className="relative bg-white dark:bg-slate-950 p-6 text-left border-l border-b border-slate-100 dark:border-slate-850">
                  <button 
                    onClick={() => removeFromCompare(item._id)}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                    title="Xóa khỏi so sánh"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex flex-col gap-2">
                    <div className="aspect-square w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800">
                      <img 
                        src={getFileUrl(item.imageUrl)} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2000&auto=format&fit=crop'; }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{item.brand}</span>
                    <h3 className="text-sm font-black text-blue-950 dark:text-white line-clamp-2 h-10 leading-tight uppercase">
                      {item.name}
                    </h3>
                  </div>
                </th>
              ))}
              {/* Empty placeholder columns to maintain 4 column layout feel */}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <th key={idx} className="bg-slate-50/20 dark:bg-slate-950/20 p-6 border-l border-b border-slate-100 dark:border-slate-850">
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-xl font-bold">+</span>
                    <span className="text-[9px] font-black uppercase tracking-widest mt-1">Trống</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row: SKU */}
            <tr className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
              <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/10">
                Mã SKU
              </td>
              {compareItems.map(item => (
                <td key={item._id} className="p-6 text-xs font-bold text-blue-950 dark:text-white uppercase tracking-wider border-l border-slate-100 dark:border-slate-850">
                  {item.sku || 'N/A'}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-800 text-xs">
                  -
                </td>
              ))}
            </tr>

            {/* Row: Price */}
            <tr className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
              <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/10">
                Giá bán
              </td>
              {compareItems.map(item => {
                const formattedPrice = new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(item.price || 0);
                const isLowest = item._id === lowestPriceId && compareItems.length > 1;
                return (
                  <td key={item._id} className="p-6 border-l border-slate-100 dark:border-slate-850">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-base font-black text-blue-950 dark:text-white tracking-tight">{formattedPrice}</span>
                      {isLowest && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider rounded-sm w-max">
                          Giá Tốt Nhất
                        </span>
                      )}
                    </div>
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-800 text-xs">
                  -
                </td>
              ))}
            </tr>

            {/* Row: Classification */}
            <tr className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
              <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/10">
                Phân loại gốc
              </td>
              {compareItems.map(item => (
                <td key={item._id} className="p-6 border-l border-slate-100 dark:border-slate-850">
                  <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-sm ${
                    item.partType === 'OEM' 
                      ? 'bg-blue-600 text-white' 
                      : item.partType === 'OES' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-700 text-white'
                  }`}>
                    {item.partType || 'Aftermarket'}
                  </span>
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-800 text-xs">
                  -
                </td>
              ))}
            </tr>

            {/* Row: Origin */}
            <tr className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
              <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/10">
                Xuất xứ
              </td>
              {compareItems.map(item => (
                <td key={item._id} className="p-6 text-xs font-bold text-slate-700 dark:text-slate-300 border-l border-slate-100 dark:border-slate-850">
                  {getOrigin(item.brand)}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-800 text-xs">
                  -
                </td>
              ))}
            </tr>

            {/* Row: Compatibility Match */}
            <tr className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
              <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/10">
                Độ tương thích
              </td>
              {compareItems.map(item => {
                const check = checkCompatibility(item);
                return (
                  <td key={item._id} className="p-6 border-l border-slate-100 dark:border-slate-850">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${
                      check.status === 'yes' 
                        ? 'text-emerald-600' 
                        : check.status === 'no' 
                          ? 'text-red-500' 
                          : 'text-slate-400'
                    }`}>
                      {check.status === 'yes' && <Check size={12} />}
                      {check.status === 'no' && <AlertTriangle size={12} />}
                      {check.text}
                    </span>
                  </td>
                );
              })}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-800 text-xs">
                  -
                </td>
              ))}
            </tr>

            {/* Dynamic Specification Rows */}
            {specsRows.map(specKey => (
              <tr key={specKey} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/10">
                  {specKey}
                </td>
                {compareItems.map(item => {
                  const specs = getSpecs(item);
                  return (
                    <td key={item._id} className="p-6 text-xs font-medium text-slate-700 dark:text-slate-300 border-l border-slate-100 dark:border-slate-850">
                      {specs[specKey] || 'Theo tiêu chuẩn OEM'}
                    </td>
                  );
                })}
                {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                  <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-800 text-xs">
                    -
                  </td>
                ))}
              </tr>
            ))}

            {/* Row: Warranty */}
            <tr className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
              <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/10">
                Bảo hành
              </td>
              {compareItems.map(item => (
                <td key={item._id} className="p-6 text-xs font-bold text-slate-700 dark:text-slate-300 border-l border-slate-100 dark:border-slate-850">
                  {getWarranty(item)}
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-800 text-xs">
                  -
                </td>
              ))}
            </tr>

            {/* Row: Stock Status */}
            <tr className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
              <td className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/10">
                Trạng thái kho
              </td>
              {compareItems.map(item => (
                <td key={item._id} className="p-6 border-l border-slate-100 dark:border-slate-850">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    item.stock > 10 
                      ? 'text-emerald-600' 
                      : item.stock > 0 
                        ? 'text-amber-500 animate-pulse' 
                        : 'text-red-500'
                  }`}>
                    {item.stock > 10 ? 'Còn hàng' : item.stock > 0 ? `Sắp hết (Còn ${item.stock})` : 'Tạm hết hàng'}
                  </span>
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-800 text-xs">
                  -
                </td>
              ))}
            </tr>

            {/* Row: CTA Action Buttons */}
            <tr>
              <td className="p-6 bg-slate-50/20 dark:bg-slate-900/5"></td>
              {compareItems.map(item => (
                <td key={item._id} className="p-6 border-l border-slate-150 dark:border-slate-850">
                  <button 
                    onClick={() => { addToCart(item); alert('Đã thêm vào giỏ hàng!'); }}
                    disabled={item.stock === 0}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg shadow-orange-500/15"
                  >
                    <ShoppingCart size={14} /> Thêm Giỏ Hàng
                  </button>
                </td>
              ))}
              {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, idx) => (
                <td key={idx} className="p-6 border-l border-slate-100 dark:border-slate-850"></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* AI Advisory Section */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {renderAIRecommendation()}
      </div>
    </div>
  );
};

export default Compare;
