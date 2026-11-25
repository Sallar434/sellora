/* ===== v45/v46: VendOm Theme Store — 468 original free themes (120 + 348 added in v46), each with its own design and styles. ===== */
(function(){
var X=window,q=X.SX.q,qa=X.SX.qa,h=X.SX.h,A=X.ACT;
var IMG='demo/';
var HSET={1:1,2:1,11:1,13:1,14:1,15:1,16:1,20:1,21:1,22:1,23:1,24:1,25:1,26:1,28:1,29:1,30:1,31:1,33:1,34:1,35:1,37:1,38:1,40:1,41:1,42:1,43:1,44:1,51:1,53:1,54:1,55:1,56:1,57:1,60:1,63:1,65:1,66:1,69:1,70:1,72:1,73:1,75:1,77:1,82:1,83:1,87:1,88:1,89:1,90:1,91:1,94:1,95:1,96:1,98:1,101:1,102:1,104:1,105:1,106:1,107:1,111:1,112:1,113:1,116:1,117:1,118:1,119:1,120:1,121:1,123:1,125:1,131:1,132:1,138:1};
function pi(i){return IMG+'p'+i+'.webp'}
function hi(i){return IMG+(HSET[i]?'h':'p')+i+'.webp'}

/* ---------- demo catalogues (theme previews only; never added to a real store) ---------- */
var DEMO={
fashion:{p:[[13,'Sunbeam co-ord',64],[118,'Scarlet maxi dress',96,120],[69,'Ruby knit top',42],[117,'Linen sundress',58],[119,'Velvet off-shoulder dress',88],[120,'Crimson wrap dress',79,99],[74,'Crochet poncho',46],[19,'Blush joggers',38]],c:[['Dresses',118],['Knitwear',121],['Co-ords',13],['Accessories',124]],h:[14,70,132,118,72,73,120,15,13,117,119,69,16,121],copy:[['New season, softly made','Easy pieces in breathable fabrics for long, warm days.'],['Dressed for golden hour','Colour, movement and a fit that feels like you.'],['The summer edit','Linen, knits and dresses picked for the season.']]},
men:{p:[[75,'Biker leather jacket',189],[116,'Heather hoodie',54],[76,'Distressed denim',68],[77,'Stone chinos',52],[18,'Essential white tee',22],[135,'Crest tee',28],[122,'Beanie duo',24],[81,'Leather derby',120]],c:[['Outerwear',102],['Tees',115],['Denim',136],['Shoes',7]],h:[102,104,123,116,75,77],copy:[['Built for every day','Wardrobe staples cut sharp and made to last.'],['Street ready','Layers, denim and leather for the city.'],['Wear it your way','Clean basics, bold outerwear.']]},
beauty:{p:[[63,'Amber face oil',34],[64,'Gentle cleanser',18],[100,'Night cream',29],[133,'Botanical serum set',52,64],[134,'Repair hair mask',24],[137,'Volume mascara',19],[10,'Daily SPF 50',22],[101,'Morning ritual kit',64]],c:[['Skincare',101],['Makeup',11],['Hair',134],['Sets',133]],h:[65,66,125,11,101,63],copy:[['Skin, but calmer','Clean formulas that do one thing well.'],['Your glow ritual','Oils, serums and creams for every skin type.'],['Beauty, simplified','Fewer steps, better skin.']]},
jewel:{p:[[32,'Pearl strand',220],[33,'Sapphire drop',180],[34,'Rose gold tennis',340],[35,'Halo ring',460],[138,'Shell studs',75],[128,'Rose dial watch',150],[5,'White dial watch',120],[124,'Gold rim shades',85]],c:[['Necklaces',33],['Rings',35],['Bracelets',34],['Watches',128]],h:[33,34,35,138],copy:[['Made to be kept','Fine jewellery crafted by hand, one piece at a time.'],['Little lights','Everyday gold, pearls and stones.'],['Heirlooms in the making','Pieces you will wear for years.']]},
home:{p:[[20,'Emerald sofa',1290],[21,'Mustard lounge chair',420],[22,'Tufted accent chair',310],[62,'Oak stool',95],[25,'Stone vases',64],[98,'Amber candle',26],[26,'Camel sofa',1180,1350],[23,'Grey sectional',1490]],c:[['Living',23],['Seating',21],['Decor',25],['Candles',98]],h:[24,23,26,21,20,22,25,98],copy:[['Rooms that feel like you','Furniture and decor made for slow living.'],['Home, but softer','Warm materials, simple shapes.'],['Make space','Pieces for the way you live now.']]},
food:{p:[[27,'Steak night box',48],[28,'Garden bowl kit',22],[31,'Harvest bowl',18],[90,'Choc chip cookies',12],[91,'Sprinkle donuts',14],[92,'Cookie sundae',9],[89,'Fruit box',26],[96,'Cold-press olive oil',19]],c:[['Meals',31],['Bakery',90],['Fresh',89],['Pantry',96]],h:[87,88,28,89,31,90,91],copy:[['Fresh from the market','Seasonal food delivered to your door.'],['Good food, fast','Meal kits, bakes and pantry staples.'],['Taste the season','Picked this morning, on your table tonight.']]},
drinks:{p:[[29,'House latte beans',16],[30,'Morning roast',15],[93,'Fresh orange',6],[94,'Cocktail kit',38],[95,'Red blend',24],[126,'Pineapple cold-press',7],[97,'Steel bottle',30],[96,'Olive oil',19]],c:[['Coffee',30],['Juices',93],['Bar',94],['Wine',95]],h:[29,30,94,95],copy:[['Roasted in small batches','Coffee with character, delivered fresh.'],['Pour something good','Drinks for slow mornings and late nights.'],['Sip the season','Fresh juices, roasts and blends.']]},
tech:{p:[[2,'Studio headphones',149],[45,'Phone X',699],[47,'Smart watch',249,299],[48,'Wired headphones',79],[49,'Wireless buds',99],[50,'Slim keyboard',69],[105,'Laptop 14',999],[111,'Bookshelf speaker',219]],c:[['Audio',109],['Computers',105],['Gaming',112],['Wearables',47]],h:[106,107,112,113,2,105,111],copy:[['Sound you can feel','Headphones, speakers and gear for every day.'],['Tech that just works','Smart devices, honest prices.'],['Upgrade your setup','Laptops, audio and accessories.']]},
sport:{p:[[41,'Power leggings',48],[42,'Dumbbell set',160],[43,'Track bike',890],[44,'Carbon road bike',1890],[97,'Insulated bottle',30],[7,'Knit runner',120],[39,'Day pack',75],[40,'Lifting straps',18]],c:[['Cycling',43],['Training',42],['Apparel',41],['Gear',39]],h:[40,42,44,43,41],copy:[['Train harder','Gear for the work you put in.'],['Ride further','Bikes and kit built for distance.'],['Move every day','Performance wear and training gear.']]},
bags:{p:[[37,'Scarlet top-handle',240],[38,'Wicker tote',120],[39,'Navy backpack',89],[99,'Saddle crossbody',140],[59,'Kraft shopper',15],[124,'Gold rim shades',85],[6,'Classic shades',95],[5,'White dial watch',120]],c:[['Totes',38],['Backpacks',39],['Crossbody',99],['Eyewear',6]],h:[37,38,15],copy:[['Carry it well','Bags made to go everywhere with you.'],['Finishing touches','Bags, shades and watches.'],['Hands-free style','Totes, packs and crossbodies.']]},
pets:{p:[[53,'Trail harness',28],[54,'Duo leash set',34],[55,'Window lounger',46],[57,'Pet-safe succulent',22],[59,'Treat tote',15],[97,'Travel bottle',30]],c:[['Dogs',53],['Cats',55],['Walks',54]],h:[53,54,55],copy:[['Happy pets, happy homes','Everything for walks, naps and play.'],['Made for good boys','Harnesses, leashes and comfy beds.'],['Pet care, done right','Quality gear for every pet.']]},
kids:{p:[[51,'Wooden train set',39],[131,'Plush friends',24],[57,'Mini planter',22],[58,'Cactus buddy',12],[61,'Sketch book',9],[59,'Play tote',15]],c:[['Toys',51],['Plush',131],['Art',61]],h:[51,131],copy:[['Play every day','Toys that spark big imaginations.'],['Little hands, big ideas','Wooden toys, plush friends and art kits.'],['Joy in every box','Gifts kids actually love.']]},
garden:{p:[[56,'Garden trowel',18],[57,'Mint pot succulent',22],[58,'Mini cactus',12],[25,'Stone vases',64],[59,'Kraft tote',15],[62,'Oak stool',95]],c:[['Tools',56],['Plants',57],['Pots',25]],h:[56,57],copy:[['Grow something good','Plants, pots and tools for every space.'],['Green at home','Easy plants for busy people.'],['Get your hands dirty','Garden tools that last.']]},
auto:{p:[[82,'Night coupe model',89],[83,'Track car print',35],[84,'Pro wrench set',89],[46,'Dash mount bundle',39],[97,'Travel bottle',30],[39,'Garage pack',75]],c:[['Tools',84],['Models',82],['Garage',83]],h:[82,83],copy:[['Built for drivers','Tools, parts and gear for the road.'],['Garage goals','Everything your car needs.'],['Drive with confidence','Quality parts, fast delivery.']]},
books:{p:[[60,'Business reads set',48],[61,'Spiral notebook',9],[59,'Kraft tote',15],[62,'Reading stool',95],[98,'Reading candle',26],[50,'Slim keyboard',69]],c:[['Books',60],['Stationery',61],['Gifts',59]],h:[60],copy:[['Read something new','Books and paper goods for curious minds.'],['Stories worth keeping','Hand-picked books every month.'],['Write it down','Notebooks and desk goods.']]}
};
var IND={fashion:['Clothing'],men:['Clothing','Shoes'],beauty:['Beauty','Wellness'],jewel:['Jewelry and accessories'],home:['Home'],food:['Food and drink'],drinks:['Food and drink'],tech:['Electronics'],sport:['Sports'],bags:['Bags','Jewelry and accessories'],pets:['Pets'],kids:['Kids','Toys'],garden:['Garden'],auto:['Auto','Hardware'],books:['Art','Office']};
var FONTS=[['Inter','Inter'],['Playfair Display','Inter'],['Cormorant Garamond','Manrope'],['DM Serif Display','DM Sans'],['Space Grotesk','Inter'],['Archivo Black','Archivo'],['Bebas Neue','Work Sans'],['Fraunces','Outfit'],['Syne','Manrope'],['Unbounded','DM Sans'],['Instrument Serif','Inter'],['Sora','Sora'],['Bricolage Grotesque','Figtree'],['Libre Baskerville','Work Sans'],['Anton','Inter'],['Outfit','Outfit']];
var MOOD={lux:{f:[2,10,13,1,3],hero:['center','card','full','split'],hdr:['stack','center','left'],card:['plain','border'],btn:['square','outline'],caps:1},
 bold:{f:[5,6,14,9,8],hero:['type','block','full','mosaic'],hdr:['dark','left','pill'],card:['tile','shadow','plain'],btn:['square','pill'],caps:1},
 soft:{f:[7,3,12,15,11],hero:['split','card','center','block'],hdr:['pill','center','left'],card:['round','tile'],btn:['pill','soft'],caps:0},
 modern:{f:[0,4,11,8,15,12],hero:['full','mosaic','split','card'],hdr:['left','dark','pill','center'],card:['plain','border','shadow'],btn:['soft','pill','square'],caps:0},
 editorial:{f:[10,1,2,13,3],hero:['type','mosaic','full','center'],hdr:['stack','center','left'],card:['plain','border'],btn:['outline','square'],caps:1}};
/* name|demo|mood|bg|text|accent|surface */
var ROWS=('Kestrel|fashion|lux|#F7F4EF|#1C1A17|#8C6A4F|#EDE6DC;Marigold|fashion|soft|#FFF7EC|#2B1D12|#E8892B|#FBE3C4;Peony|fashion|soft|#FFF1F3|#3A1F27|#D9467A|#FBD9E2;Gossamer|fashion|editorial|#FFFFFF|#141414|#141414|#F2F2F2;Velvet|fashion|lux|#1A1016|#F6EDEA|#C9A36A|#2A1A22;Sienna|fashion|modern|#FBF8F4|#2A211C|#B5532F|#F1E7DD;Orchid|fashion|bold|#2B0F3A|#FFF4FF|#FF5FC8|#3D1852;Pashmina|fashion|lux|#F4EEE6|#3A2E25|#7D5A44|#E8DDD0;Wren|fashion|modern|#FFFFFF|#1E2422|#2F6D5E|#EEF3F1;Zephyr|fashion|soft|#EEF4FB|#182433|#3B6FD8|#DCE7F7;Halcyon|fashion|editorial|#FAF7F0|#22201C|#9A3B2E|#EFE8DA;Lattice|fashion|editorial|#FFFFFF|#111111|#C1272D|#F5F5F5;Saffron|fashion|bold|#FFF3D6|#2A1800|#E25822|#FFE3A3;Tamarind|fashion|modern|#F6F1EA|#2E1F14|#6B3E26|#EADFD1;'
+'Basalt|men|bold|#111111|#F3F3F3|#D7FF3A|#1E1E1E;Rivet|men|bold|#F2F0EA|#111111|#FF4D1F|#E4E1D8;Cinder|men|modern|#18181B|#F4F4F5|#F97316|#27272A;Granite|men|modern|#F5F5F4|#1C1917|#44403C|#E7E5E4;Talon|men|bold|#0B1F3A|#F4F7FB|#FFC93C|#13305A;Indigo|men|modern|#F3F5FB|#121A33|#3346C9|#E2E7F6;Marlow|men|editorial|#FBFAF7|#1B1B1B|#5A4632|#EEEAE2;Fjord|men|modern|#EEF2F3|#10242B|#1E6B7B|#DCE6E8;Arcade|men|bold|#FFE94A|#111111|#111111|#FFF59E;Tundra|men|lux|#F1F1EF|#23262A|#6B7480|#E3E4E1;'
+'Apricot|beauty|soft|#FFF4EC|#3B2418|#E07A5F|#FBE1D3;Lumen|beauty|modern|#FFFFFF|#1F1A1C|#B8860B|#F7F1EA;Thistle|beauty|soft|#F6F0FA|#2E2238|#8B5FBF|#EADFF3;Clove|beauty|lux|#F3ECE4|#33261D|#8A5A3C|#E6D8C8;Pomelo|beauty|bold|#FFE5E0|#2B0E0A|#FF5A45|#FFD0C7;Sorrel|beauty|soft|#F2F6EF|#22301E|#5F8B4C|#E1EBDB;Opaline|beauty|soft|#F8F7FF|#24213A|#6C63FF|#ECEAFF;Rosewater|beauty|lux|#FFF0F0|#3A2323|#C25B6E|#FADADF;Terracotta|beauty|lux|#EFE7DD|#2D241C|#A0522D|#E2D5C5;Dewdrop|beauty|modern|#EEF8F6|#173330|#2A9D8F|#D8EFEB;'
+'Aurelia|jewel|lux|#FBF8F3|#1C1A17|#B08D57|#F1EADF;Solstice|jewel|lux|#111111|#F5F1E8|#D4AF37|#1C1C1C;Gilded|jewel|editorial|#FFFFFF|#161616|#9C7A3C|#F4F1EA;Moonstone|jewel|soft|#F4F6F8|#1F2933|#7B8FA6|#E5EAF0;Carat|jewel|modern|#FAFAF9|#0F0F0F|#A16207|#EFEDE8;Filigree|jewel|lux|#F7F2EE|#3A2A22|#8E5B4A|#EDE2DA;Garnet|jewel|bold|#2A0A10|#FBEFEF|#E0B15C|#3A1218;Marquise|jewel|editorial|#FCFBF9|#222222|#7A5C3E|#F2EEE7;'
+'Larch|home|modern|#F6F3EE|#23211E|#5B6B4E|#EAE5DC;Oakhurst|home|lux|#F3EFE8|#2A2520|#7A5C3E|#E6DFD3;Loom|home|soft|#F7F1EA|#3A2F27|#B56A4A|#EEE2D6;Mesa|home|modern|#F2E9DF|#2E2119|#C0703C|#E7D8C6;Ochre|home|bold|#F4E3C1|#2A1D0E|#B8741A|#EBD3A4;Lantern|home|editorial|#FFFFFF|#1A1A1A|#3F5D4A|#F1F3EF;Burrow|home|soft|#EEF0EA|#262A22|#6E7F5C|#DEE3D6;Quill|home|editorial|#F8F6F2|#1D1B19|#8B3A2B|#EDE8DF;Atrium|home|modern|#FFFFFF|#15171A|#0F766E|#EEF4F3;Driftwood|home|lux|#ECE8E1|#2B2A27|#8A7F6C|#DDD8CE;'
+'Fennel|food|soft|#F3F7EC|#1F2A17|#4F7A28|#E2EBD3;Sumac|food|bold|#FFF1E6|#2D0F0A|#C2410C|#FDDCC4;Pantry|food|modern|#FFFDF8|#2B2620|#D97706|#F5ECDB;Larder|food|editorial|#F8F4EC|#2A2219|#7C2D12|#EDE3D1;Brisket|food|bold|#1C1410|#FFF4E8|#F59E0B|#2A1F18;Harvest|food|soft|#FBF6EA|#2F2617|#A16207|#F2E8CF;Crumb|food|soft|#FFF6EE|#3B2618|#E76F51|#FCE3D2;Tandoor|food|bold|#2B1408|#FFF1E2|#FF7A1A|#3B1E0E;'
+'Roastery|drinks|lux|#F1EAE1|#2A1E16|#6F4E37|#E4D6C6;Citrine|drinks|bold|#FFF6D6|#2A2200|#FF9F1C|#FFE89A;Cellar|drinks|lux|#1B0F12|#F7EDEA|#B4485D|#2A181C;Brew|drinks|modern|#F5F1EC|#1E1A17|#8B5E34|#E9E1D7;Spritz|drinks|soft|#FFF0E8|#3A1A10|#FF6B4A|#FFD9CB;Barrel|drinks|editorial|#F7F3EE|#231B16|#7A3E2A|#ECE4DA;'
+'Cobalt|tech|modern|#F4F7FC|#0B1220|#2563EB|#E3EAF6;Kinetic|tech|bold|#0A0A0F|#F5F6FA|#7C3AED|#16161F;Circuit|tech|modern|#FFFFFF|#0F172A|#06B6D4|#EEF7FA;Voltage|tech|bold|#0D0D0D|#F2F2F2|#22C55E|#1A1A1A;Pixel|tech|soft|#F5F3FF|#1E1B4B|#6366F1|#E7E4FF;Signal|tech|modern|#F8FAFC|#111827|#EF4444|#EEF1F5;Orbit|tech|bold|#0B1020|#EAF0FF|#38BDF8|#141C33;Monolith|tech|editorial|#EDEDED|#111111|#111111|#E0E0E0;Ampere|tech|modern|#FFFFFF|#121212|#F59E0B|#F3F3F3;Stratus|tech|soft|#EEF6FF|#0E2238|#1D7FD8|#DBEBFC;'
+'Ridge|sport|bold|#F2F4F1|#10170F|#E11D48|#E1E6DF;Pacer|sport|bold|#111111|#FAFAFA|#FF3B1F|#1D1D1D;Alpine|sport|modern|#F3F6F8|#10212B|#0E7490|#E1EAEE;Trailhead|sport|modern|#F1EFE9|#1F2419|#556B2F|#E4E1D6;Cadence|sport|bold|#0F172A|#F8FAFC|#A3E635|#1E293B;Torrent|sport|bold|#FFFFFF|#0B0B0B|#2563EB|#F1F3F7;Grit|sport|bold|#E9E6DF|#141414|#F97316|#DAD6CC;Stride|sport|modern|#FAFAFA|#121212|#10B981|#EFEFEF;'
+'Carryall|bags|soft|#F6F1EA|#2F261E|#9C4A2F|#EBE1D4;Parcel|bags|modern|#FFFFFF|#1A1A1A|#B91C1C|#F4F4F4;Buckle|bags|lux|#EFE9E1|#2B231C|#6B4226|#E2D8CB;Wanderer|bags|modern|#EEF1F0|#1B2422|#A3472A|#DEE4E2;Clasp|bags|editorial|#FBFAF8|#191919|#7C5C3B|#F0EDE7;'
+'Biscuit|pets|soft|#FFF6E9|#3A2A17|#F08A24|#FCE6C6;Whisker|pets|soft|#F1F5FF|#1E2A4A|#5B7CFA|#E1E8FF;Kibble|pets|bold|#FFE14D|#1C1A00|#1C1A00|#FFF0A0;Meadowlark|pets|modern|#F2F6EE|#1E2B1A|#3F7D3A|#E0EAD9;'
+'Pinwheel|kids|soft|#FFF4F8|#2D1B3D|#FF6FAE|#FFE0EE;Crayon|kids|bold|#FFF8D6|#1F2A44|#3B82F6|#FFEDA0;Teddy|kids|soft|#FAF3EA|#3B2A1E|#C97C4A|#F1E2D0;Hopscotch|kids|bold|#E9F7FF|#12304A|#FF7849|#CDEBFF;'
+'Fernwood|garden|modern|#EFF4EC|#1D2A1A|#3D6B35|#DCE7D6;Terrarium|garden|soft|#F4F1E8|#263221|#6A8D52|#E7E3D3;Potting|garden|editorial|#F8F6F1|#1F1D1A|#5E7C4C|#EDE9E0;'
+'Piston|auto|bold|#0F0F10|#F2F2F2|#DC2626|#1C1C1E;Chassis|auto|modern|#F3F4F6|#111827|#F59E0B|#E5E7EB;Gearhead|auto|bold|#1A1D21|#F5F5F5|#FACC15|#262A30;'
+'Margin|books|editorial|#FBF9F4|#1C1B19|#8B2E2E|#EFEBE2;Inkwell|books|lux|#F4EFE6|#1F1A14|#2F4858|#E7E0D3;Chapter|books|modern|#FFFFFF|#141414|#4338CA|#F1F1F6;'
+'Beacon|tech|modern|#0B0B0C|#F5F5F7|#0A84FF|#161618|one;Vial|beauty|soft|#F7F3EE|#2C2520|#9E6B4A|#ECE3D8|one;Halo|jewel|lux|#FFFFFF|#111111|#B08D57|#F5F1EA|one;Cuvee|drinks|lux|#F3EEE8|#2A1A16|#8E2B3A|#E8DDD3|one;'
+'Bazaar|tech|modern|#FFFFFF|#111827|#E11D48|#F3F4F6|lots;Emporium|food|bold|#FFFDF5|#1B1B1B|#16A34A|#F1F7EC|lots;Depot|sport|modern|#F5F6F7|#0F172A|#F97316|#E8EAED|lots;Arcadia|fashion|modern|#FFFFFF|#161616|#7C3AED|#F4F2FB|lots;'
+'Indus|fashion|lux|#F6F0E6|#2A1F14|#8B1E3F|#EBDDCA|new;Hunza|food|soft|#F1F6F4|#13302A|#0F7B6C|#DCEDE8|new;Monsoon|men|modern|#E9EEF0|#12202A|#2B6777|#D6E0E4|new;Shalimar|home|lux|#F5EFE6|#2B2117|#1F5C4A|#E9DFD0|new;Ajrak|fashion|bold|#1E0D0D|#FBEFE6|#C1272D|#2E1515|new;Chenab|beauty|modern|#F1F6F9|#142531|#2E86AB|#DDEBF2|new').split(';');

var HERO_L={full:'Full image',center:'Centred',split:'Split',type:'Big type',mosaic:'Mosaic',card:'Card',block:'Colour block'};
var HDR_L={left:'Logo left',center:'Logo centred',stack:'Stacked',dark:'Dark bar',pill:'Floating'};
var LAYOUTS={
 A:['hero','marquee','cats','grid','promo','grid2','news'],B:['hero','feats','grid','look','story','news'],C:['hero','cats','promo','grid','marquee','look'],
 D:['hero','grid','promo2','cats','story','feats'],E:['hero','story','look','grid','news'],F:['hero','marquee','grid','cats','promo','feats','news'],
 G:['hero','feats','promo','story','grid3','news'],H:['hero','cats6','grid5','promo','grid2','feats']};
var LORDER='ABCDEF';

function lum(c){c=c.replace('#','');var r=parseInt(c.substr(0,2),16)/255,g=parseInt(c.substr(2,2),16)/255,b=parseInt(c.substr(4,2),16)/255;var f=function(v){return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)}
function onAc(c){return lum(c)>.4?'#111111':'#FFFFFF'}
function slugify(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-')}

/* ---------- build the library: each theme gets a design combination no other theme has ---------- */
var LIB=[],USED={};
ROWS.forEach(function(r,i){var a=r.split('|');if(a.length<7)return;var m=MOOD[a[2]],d=DEMO[a[1]],kind=a[7]||'';
 var pick=null;
 for(var k=0;k<600&&!pick;k++){var hero=m.hero[(i+k)%m.hero.length],hdr=m.hdr[(i*3+k+Math.floor(k/4))%m.hdr.length],card=m.card[(i+Math.floor(k/2))%m.card.length],f=m.f[(i*7+Math.floor(k/3))%m.f.length],sig=hero+'/'+hdr+'/'+card+'/'+f;if(!USED[sig]){USED[sig]=1;pick={hero:hero,hdr:hdr,card:card,f:f,sig:sig}}}
 if(!pick)pick={hero:m.hero[0],hdr:m.hdr[0],card:m.card[0],f:m.f[0],sig:'x'+i};
 var lay=kind==='one'?'G':kind==='lots'?'H':LORDER.charAt((i*5+a[1].length)%6);
 LIB.push({id:'v-'+slugify(a[0]),name:a[0],demo:a[1],mood:a[2],bg:a[3],tx:a[4],ac:a[5],s:a[6],kind:kind,isNew:kind==='new'||i%11===3,hero:pick.hero,hdr:pick.hdr,card:pick.card,fp:pick.f,btn:m.btn[i%m.btn.length],caps:m.caps&&(i%3!==1)?1:0,rad:{soft:14,modern:8,lux:0,bold:0,editorial:0}[a[2]],lay:lay,i:i,
  size:kind==='one'?'One product':kind==='lots'?'Lots (100+)':(i%3===0?'Few (2–10)':'Some (11–100)'),ind:IND[a[1]].slice()})});

/* ---------- v46: 348 more original themes. Each one has its own industries, catalog sizes and ready-made styles (colour presets). ---------- */
/* name|demo|mood|industries|sizes|layout|styles (bg,text,accent,surface; ...) */
var ROWS2=[
'Alder|fashion|lux|sp,cl,we,be,el|sl|H|F8F8F8,141414,E03838,E0E0E0;F8F8F8,141414,805008,E0E0E0;F8F8E0,141414,082080,E0E0E0;202020,F5F5F5,688098,383838;F8F8F8,141414,1A1A1A,F8C8E0',
'Amaranth|sport|modern|sp,we,fd,be,pe|fs|C|F8E0E0,141414,F86898,E0C8B0;F8E0E0,141414,388068,E0C8B0;C8C8B0,141414,1C1C1C,E0E0E0;E0E0E0,141414,685038,F8E0E0;E0E0C8,141414,1A1A1A,C8C898',
'Ambergris|kids|soft|se,fd,ki,to,be|of|F|F8F8F8,141414,2068F8,F2F2F2;F8F8F8,141414,E08050,E08068;F8F8F8,141414,141414,98C8E0;F8C8B0,141414,1A1A1A,F8F8F8;E0F8F8,141414,141414,F2F2F2',
'Anise|fashion|soft|sp,cl,je|s|B|C8C8C8,141414,805038,F8F8F8;080808,F5F5F5,FDFDFD,222222;F8F8F8,141414,141414,80B0C8',
'Antler|fashion|bold|cl,bg,ki,be|sl|H|080808,F5F5F5,FDFDFD,382020;F8F8F8,141414,380808,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2;E0E0E0,141414,141414,C8C8C8',
'Applewood|fashion|editorial|cl,fd,be,je,el|s|E|F8F8F8,141414,385080,B0B0B0;C8C8C8,141414,1C1C1C,E0E0E0;385038,F5F5F5,FDFDFD,385050;E0E0E0,141414,685038,F8E0E0;F8F8F8,141414,1C1C1C,989898',
'Aquila|tech|bold|au,sp,fd,be,el|l|H|080808,F5F5F5,989808,202020;080820,F5F5F5,689820,082038;080808,F5F5F5,FDFDFD,202020;200820,F5F5F5,F5F5F5,080808;080808,F5F5F5,F5F5F5,202020',
'Arbor|home|lux|cl,ho,we,sh,ar|sl|D|383838,F5F5F5,FDFDFD,222222;203820,F5F5F5,FDFDFD,222222;F8F8F8,141414,1C1C1C,B0B098;F8F8F8,141414,1C1C1C,B09898;E0E0E0,141414,1C1C1C,F8F8F8',
'Archway|fashion|modern|cl,ho,hw,fd,be|l|H|F8F8F8,141414,3880F8,3880F8;F8F8F8,141414,B09880,E0E0E0;F8F8F8,141414,988068,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Argent|pets|soft|cl,el,pe|fsl|A|F8F8F8,141414,3F517B,F8C8E0;F8F8F8,141414,B098C8,E0E0E0;F8F8F8,141414,141414,E0F8F8;F8F8F8,141414,1A1A1A,E0E0F8',
'Arroyo|tech|modern|sp,cl,el|sl|H|F8F8F8,141414,E08068,E0E0E0;F8F8F8,141414,508098,E0E0E0;F8F8F8,141414,141414,F8F8E0',
'Ashgrove|fashion|soft|cl,ho,be|s|E|F8F8F8,141414,989868,F8F8E0;F8F8F8,141414,141414,C8C8C8;F8F8F8,141414,1A1A1A,E0E0E0',
'Aspenleaf|food|modern|fd|s|A|F8F8E0,141414,E03820,F2F2F2;F8F8F8,141414,98B020,E0E0E0;F8F8F8,141414,682020,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Astral|food|modern|ho,fd,el|sl|C|F8F8F8,141414,685038,E0E0E0;F8F8F8,141414,1A1A1A,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Avocet|jewel|lux|cl,ho,ar,be,je|fsl|E|F8F8F8,141414,B08050,E0E0E0;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,141414,E0B0B0;E0E0E0,141414,1C1C1C,F8F8F8;F8F8E0,141414,1C1C1C,C8C8C8',
'Azurite|jewel|lux|cl,we,ar,be,je|sl|B|F8F8F8,141414,B02038,F8F8E0;202020,F5F5F5,C8B098,222222;F8F8F8,141414,C89880,C8C8C8;080808,F5F5F5,FDFDFD,202020;F8F8F8,141414,141414,E0E0E0',
'Balsam|tech|lux|sp,fd,ki,el,pe|s|C|F8F8F8,141414,5080B0,E0E0E0;F8F8E0,141414,688038,F8F8F8;F8F8F8,141414,688098,F2F2F2;F8F8F8,141414,686838,F2F2F2;F8F8E0,141414,1A1A1A,F8E0B0',
'Bannock|fashion|modern|cl,ho,sh|s|F|202038,F5F5F5,FDFDFD,222222;F8F8F8,141414,382008,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0',
'Baobab|men|bold|sh,fd,be|s|B|203880,F5F5F5,F8B080,222222;B0C8B0,141414,141414,C89880;F8F8F8,141414,203850,C8C8C8',
'Barley|bags|lux|cl,bg,el|fs|D|F8F8F8,141414,503820,F2F2F2;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,C8C8C8',
'Bayleaf|fashion|modern|cl,fd,ar,je|sl|H|F8F8F8,141414,203868,E0E0E0;F8F8F8,141414,203850,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0;E0E0C8,141414,1C1C1C,F8F8E0',
'Beechnut|auto|editorial|au,hw,to,pe|sl|A|F8F8F8,141414,B02080,E0E0E0;F8F8F8,141414,083868,F2F2F2;F8F8F8,141414,688038,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2',
'Bellflower|beauty|soft|we,be|s|C|F8F8F8,141414,988068,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2',
'Bergamot|pets|modern|pe|s|F|089880,F5F5F5,FFFFFF,222222',
'Birchbark|home|lux|cl,ho,we,ar,je|s|B|F8F8F8,141414,6898B0,C8C8C8;F8F8F8,141414,805038,F2F2F2;F8F8F8,141414,B09880,C8B0B0;F8F8F8,141414,1C1C1C,E0E0E0',
'Bittern|fashion|bold|cl,ho,to|sl|C|F8F8F8,141414,F86850,E0E0E0;E0E0E0,141414,141414,F8F8F8;F8F8F8,141414,1C1C1C,808080',
'Blackthorn|fashion|modern|cl,fd|fs|E|080808,F5F5F5,C86838,222222;F8F8F8,141414,E02038,C8C8C8;F8F8F8,141414,141414,E0E0E0',
'Bluebell|fashion|lux|sp,cl,be|s|B|F8F8F8,141414,3868B0,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0',
'Bobbin|sport|soft|sp,cl,ho,ga,el|s|C|F8F8F8,141414,805038,E0E0E0;F8F8F8,141414,141414,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2;F8F8E0,141414,1C1C1C,F8F8F8',
'Bracken|beauty|modern|cl,ho,be,je,el|s|E|F8F8F8,141414,806850,E0E0E0;F8F8F8,141414,383808,F2F2F2;F8F8F8,141414,1C1C1C,B0B0C8;F8F8F8,141414,1A1A1A,F2F2F2',
'Brindle|beauty|editorial|ho,fd,be,je,el|fsl|B|F8F8F8,141414,502008,F2F2F2;C89868,141414,1A1A1A,B09868;F8F8F8,141414,141414,E0E0E0;E0E0E0,141414,1C1C1C,F8F8F8',
'Bristol|books|bold|sp,se,we,el|sl|C|F8F8F8,141414,8098B0,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Brookline|fashion|soft|cl,sh,be,je|l|H|F8F8F8,141414,C83838,F8E0E0;F8E0E0,141414,986850,F8F8E0;F8F8F8,141414,1C1C1C,C8C8C8;F8F8F8,141414,141414,C8C8B0;F8F8F8,141414,1C1C1C,F8F8E0',
'Bunting|books|modern|of,we,fd,be|fs|B|E0E0E0,141414,5098E0,F8F8F8;F8F8F8,141414,C89880,E0E0E0;F82038,F5F5F5,FFFFFF,222222;F8F8F8,141414,505020,F2F2F2',
'Burnish|home|modern|cl,ho,el|sl|H|F8F8F8,141414,B09880,B09898;F8F8F8,141414,1C1C1C,E0E0E0',
'Buttercup|bags|lux|se,bg,ga,to|fs|E|F8F8F8,141414,986838,F2F2F2;F8F8F8,141414,685020,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Calico|beauty|soft|cl,bg,be,je,el|s|B|080808,F5F5F5,685038,222222;E0E0E0,141414,B08050,F8F8F8;080820,F5F5F5,F5F5F5,202020;080820,F5F5F5,FDFDFD,222222',
'Camber|drinks|bold|we,sh,fd|fsl|C|080808,F5F5F5,C88050,222222;F8F8F8,141414,806850,808068',
'Candlenut|jewel|bold|cl,ga,be,je,el|s|E|F8F8F8,141414,B08068,F8F8E0;F8F8F8,141414,503820,E0E0E0;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Cardamom|kids|lux|cl,ki,ar,be,je|s|B|F8F8F8,141414,B05020,F2F2F2;F8F8F8,141414,1A1A1A,F8F8E0;F8F8F8,141414,141414,F8F8E0;F8F8F8,141414,141414,E0E0E0',
'Carnelian|fashion|modern|cl,ho,en,fd,je|fsl|D|F8E0F8,141414,0868B0,F2F2F2;F8F8F8,141414,B09850,F8F8E0;F8F8F8,141414,6868C8,F8F8E0;F8F8F8,141414,988068,F2F2F2;F8F8F8,141414,141414,C8B098',
'Cassia|drinks|lux|fd,je|s|F|F8F8F8,141414,505020,E0E0C8;E0E0E0,141414,1C1C1C,F8F8F8;F8F8F8,141414,1C1C1C,E0E0C8;F8F8F8,141414,1C1C1C,808080',
'Catkin|fashion|modern|sp,cl,ho,fd,be|sl|H|F8F8F8,141414,505080,E0E0E0;F8F8F8,141414,1C1C1C,808080;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0;E0E0E0,141414,1C1C1C,F2F2F2',
'Cedarline|men|bold|cl,ho,sh,fd,je|fs|C|F8F8F8,141414,80B0C8,E0E0E0;F8F8F8,141414,986850,F8E0E0;E0E0E0,141414,1C1C1C,F2F2F2;E0E0C8,141414,141414,C8C8C8;F8F8E0,141414,141414,F8E0C8',
'Celadon|home|lux|cl,ho,ar,be,je|s|E|F8F8F8,141414,986850,E0E0E0;F8F8F8,141414,685038,F2F2F2;F8F8F8,141414,B09880,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0',
'Chaffinch|books|lux|cl,ho,of,be,je|s|B|F8F8F8,141414,B03820,F2F2F2;F8F8F8,141414,B08068,E0E0E0;F8F8F8,141414,806850,E0E0E0;F8F8F8,141414,141414,F8F8E0;F8F8F8,141414,1C1C1C,B0B0B0',
'Chamomile|sport|bold|sp,be,je|sl|H|F8F8F8,141414,0898B0,F2F2F2;F8F8F8,141414,C85038,E0E0E0',
'Chestnut|jewel|soft|cl,ho,bg,be,je|ofsl|E|F8F8F8,141414,682008,F2F2F2;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Chicory|books|modern|ho,bg,sh,fd,ar|s|B|F8F8F8,141414,C89868,E0E0C8;080808,F5F5F5,FDFDFD,383838',
'Cinnabar|home|lux|cl,ho,be,je|fs|C|E0E0F8,141414,986850,F8F8F8',
'Citron|beauty|bold|cl,we,ki,ar|fs|E|F8F8F8,141414,555122,F2F2F2;F8F8F8,141414,689880,E0E0E0;F8F8E0,141414,141414,E0C8B0;F8F8F8,141414,1C1C1C,F2F2F2',
'Clementine|men|lux|cl,ho,sh,je|s|B|F8F8F8,141414,C83820,F2F2F2;989898,F5F5F5,1C1C1C,202020',
'Cloudberry|jewel|editorial|fd,je|fs|C|F8F8F8,141414,141414,E0E0E0',
'Clover|beauty|soft|cl,we,fd,be,je|fsl|E|F8F8F8,141414,1D1A17,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Coalbrook|beauty|modern|cl,we,fd,ga|s|B|F8F8F8,141414,976738,F2F2F2;F8F8F8,141414,988050,E0E0E0;F8F8F8,141414,1A1A1A,E0E0C8',
'Cockle|fashion|lux|sp,cl,fd,be,je|s|C|F8F8F8,141414,6898C8,E0E0E0;F8F8F8,141414,8098B0,98B0B0;F8F8F8,141414,688098,688098;E0E0E0,141414,1C1C1C,F2F2F2',
'Copperleaf|home|lux|cl,ho,fd,be,je|s|E|F8F8F8,141414,B06838,F8F8E0;E0E0E0,141414,1C1C1C,F8F8F8;F8F8F8,141414,1C1C1C,F2F2F2',
'Cordage|beauty|lux|cl,fd,ar,be,je|s|B|F8F8F8,141414,083868,F2F2F2;F8F8F8,141414,503820,E0E0E0;F8F8F8,141414,B09880,F8F8E0;F8F8F8,141414,988068,988068',
'Cornflower|sport|modern|sp,we,be,je,el|s|C|F8F8F8,141414,C88068,E0E0E0;E0E0E0,141414,683820,F8F8F8;F8F8E0,141414,083820,E0E0E0;F8F8F8,141414,1C1C1C,E0E0C8',
'Cottonwood|beauty|lux|cl,ho,to,ar,be|sl|E|F8F8F8,141414,815138,E0E0E0;F8F8F8,141414,806850,F8F8E0;F8F8F8,141414,1A1A1A,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Cowrie|jewel|soft|sp,cl,bg,be,je|s|B|F8F8F8,141414,F83808,F83820;F8F8F8,141414,385080,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Cranberry|food|modern|fd,be,pe|fs|D|F8F898,141414,1A1A1A,68F8F8',
'Crestwood|home|lux|sp,cl,ho,sh,je|s|E|080808,F5F5F5,B09880,202020;C8F808,141414,1A1A1A,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2',
'Crocus|kids|soft|au,ho,to,je,el|ofsl|B|F8F8F8,141414,81674E,989898',
'Cypress|pets|modern|cl,fd,ar,je,pe|s|C|F8F8F8,141414,E09808,F8F8E0;F8F8F8,141414,683820,F2F2F2;F8F8F8,141414,1A1A1A,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Daffodil|sport|bold|sp,of,el|l|H|F8F8F8,141414,6B5138,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Damask|jewel|lux|cl,ho,je,el|fs|B|202020,F5F5F5,FDFDFD,383838;F8F8F8,141414,1C1C1C,989898',
'Damson|jewel|lux|cl,bg,be,je|fsl|C|F8F8F8,141414,977D64,C8C8C8;F8F8F8,141414,083838,F2F2F2;F8F8F8,141414,141414,E0E0E0',
'Dappled|beauty|lux|cl,ho,to,be,je|sl|H|F8F8F8,141414,AD7D4E,E0E0E0;F8F8F8,141414,683838,808080;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,B0B0B0',
'Dewberry|jewel|lux|cl,fd,be,je|fl|B|F8F8F8,141414,97674E,F2F2F2',
'Dovetail|jewel|lux|cl,sh,ar,be,je|fl|H|080808,F5F5F5,803838,202020;383838,F5F5F5,B09880,222222;F8F8F8,141414,388098,E0E0E0',
'Dunlin|kids|soft|ho,fd,ki,be|sl|E|F8F8F8,141414,E05068,E0E0E0;F8F8F8,141414,E06880,C86880;F8F8F8,141414,202068,E0E0E0',
'Eider|beauty|bold|ho,we,fd,ar,be|l|H|E0E0E0,141414,C83838,F2F2F2;F8F8F8,141414,141414,F2F2F2',
'Elderberry|home|lux|cl,ho,bg,sh|sl|D|080808,F5F5F5,805038,202020;E0E0C8,141414,685038,F8F8E0',
'EmberGlow|beauty|soft|en,we,ga,je,el|s|E|080808,F5F5F5,506898,202020;E0E0C8,141414,088038,F2F2F2;F8F8E0,141414,685038,F8F8F8;F8F8F8,141414,1C1C1C,F2F2F2',
'Emberly|pets|soft|au,we,to,el,pe|l|H|F8F8F8,141414,206838,F8F8E0',
'Ermine|auto|modern|au,ho,hw,ga,je|s|C|F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0',
'Eyrie|beauty|lux|cl,ho,bg,be|s|E|F8F8F8,141414,985038,E0E0E0;685038,F5F5F5,F5F5F5,222222;F8F8F8,141414,B09880,B09880;F8F8F8,141414,988068,988068',
'Fallow|beauty|bold|fd,be|s|B|F8F8F8,141414,251E1A,B0B0F8',
'Farrow|beauty|editorial|sp,cl,ho,be|s|C|F8F8F8,141414,085038,F2F2F2;080808,F5F5F5,FDFDFD,222222;F8F8F8,141414,683838,E0E0E0',
'Feldspar|auto|lux|au,cl,ho,fd,el|osl|E|080808,F5F5F5,F5F5F5,202020;F8F8F8,141414,1A1A1A,E0E0E0;F8F8F8,141414,141414,C8C8C8',
'Fiddlehead|beauty|modern|sp,ho,of,we,el|fs|A|F8F8F8,141414,B03808,F2F2F2;202020,F5F5F5,F5F5F5,080808;F8F8F8,141414,1C1C1C,E0E0E0',
'Figtree|jewel|modern|sp,cl,je|fs|C|F8F8F8,141414,25211F,E0E0E0',
'Finch|bags|modern|cl,ho,bg,sh,je|sl|E|F8F8F8,141414,D9930C,F2F2F2;F8F8F8,141414,B09880,B0B098',
'Flax|pets|modern|of,we,ga,el,pe|sl|H|F8F8F8,141414,3838C8,E0E0E0;F8F8F8,141414,1A1A1A,E0E0E0;F8F8E0,141414,1C1C1C,E0E0E0',
'Flint|garden|modern|bg,ga,ar,je|s|C|E0E0E0,141414,B08068,F8E0E0;080808,F5F5F5,FDFDFD,383838;F8F8F8,141414,988068,F2F2F2;E0C8C8,141414,1A1A1A,808080;F8F8F8,141414,141414,E0E0E0',
'Foxglove|fashion|modern|cl,we,fd,el|ofsl|F|080808,F5F5F5,8038C8,202020;E08098,F5F5F5,F8F880,222222;F8F8F8,141414,1C1C1C,E0E0E0',
'Freesia|beauty|soft|cl,be|fl|B|F8F8F8,141414,C39364,E0E0E0;E0E0C8,141414,986850,C8C8B0;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Fuchsia|beauty|lux|cl,we,be|os|C|F8F8F8,141414,C37D64,C8C8E0;F8F8F8,141414,988068,E0E0E0',
'Gannet|fashion|editorial|cl,ho,we,ar,je|s|E|E0E0E0,141414,688098,688098;F8F8F8,141414,382008,E0E0E0;F8E0E0,141414,1C1C1C,E0E0E0;E0E0E0,141414,141414,C8B098;F8F8F8,141414,1C1C1C,C8C8C8',
'Garland|books|lux|we,fd,ar,be,je|o|G|F8F8F8,141414,B00808,E0E0E0;F8F8F8,141414,50B0C8,E0B0E0;F8F8F8,141414,B08068,B08068;F8F8E0,141414,141414,F2F2F2;80F8C8,141414,1A1A1A,F8F8C8',
'Gingham|fashion|bold|sp,cl,fd,je|s|C|080808,F5F5F5,088020,202020;985050,F5F5F5,500808,380808;F8F8F8,141414,806850,F2F2F2;E0E0E0,141414,1A1A1A,F2F2F2;C8E020,141414,1A1A1A,F8F8F8',
'Glade|fashion|modern|cl,bg,sh,be,je|s|E|F8F8F8,141414,085080,E0E0E0;F8F8F8,141414,B08050,E0E0E0;F8F8F8,141414,5080B0,989898;F8F8F8,141414,B08068,F8F8E0;F8F8F8,141414,503820,E0E0E0',
'Glimmer|auto|modern|au,se,we,ki,pe|ofs|B|F8F8F8,141414,2B2520,F2F2F2;F8F8F8,141414,1C1C1C,B0B0B0;E0E0E0,141414,1C1C1C,C8C8B0',
'Goldcrest|beauty|lux|cl,bg,be,je|s|C|F8F8F8,141414,C86820,F2F2F2;F8F8F8,141414,986850,989880;F8F8F8,141414,B08068,B09880;F8F8F8,141414,685038,C8C8C8',
'Gorse|fashion|editorial|cl,we,sh|s|E|B09898,F5F5F5,1C1C1C,222222;806868,F5F5F5,FFFFFF,222222;F8F8F8,141414,380808,F2F2F2',
'Gravel|fashion|modern|sp,cl,bg,ki|s|A|F8F8F8,141414,086880,E0E0E0;080808,F5F5F5,806850,222222;F8F8F8,141414,141414,C8C8C8;F8F8F8,141414,141414,E0E0E0',
'Greylag|auto|editorial|au,sp,ho,se,hw|s|C|E0F8E0,141414,806850,E0F8F8;F8F8E0,141414,685038,F8F8F8;F8F8F8,141414,1C1C1C,F8F8E0;F8F8F8,141414,1A1A1A,F2F2F2;F8F8F8,141414,141414,F8E0B0',
'Grosbeak|tech|modern|sp,cl,ho,el|l|H|F8F8F8,141414,5068F8,E0E0E0;F8F8F8,141414,E05068,E0E0E0;F8F8F8,141414,085098,E0E0E0;F8F8F8,141414,8080E0,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Guava|fashion|soft|cl,fd,je|os|A|082020,F5F5F5,F5F5F5,203838;F8F8F8,141414,806850,E0E0E0;F8F8F8,141414,1A1A1A,F8E0E0',
'Gypsum|tech|editorial|en,fd,ar,be,je|s|D|F8F8F8,141414,81664D,F2F2F2;F8F8F8,141414,B09880,B09880;F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0',
'Hawthorn|fashion|bold|sp,cl,ki|s|F|F8F8F8,141414,805050,E0E0E0;F8F8F8,141414,141414,E0C838;E0E0E0,141414,141414,F8F8F8',
'Hazel|fashion|lux|cl,ho,sh,fd|s|B|080808,F5F5F5,8038F8,202020;F8F8F8,141414,B09868,E0E0E0;F8F8E0,141414,683820,F8F8F8;F8F8F8,141414,B09880,C8C8C8',
'Heathland|sport|editorial|au,sp,we,hw,to|osl|D|F8F8F8,141414,E08050,E08050;F8F8F8,141414,688098,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,141414,F2F2F2;F8F8F8,141414,141414,E0E0F8',
'Hemlock|auto|bold|au,sp,cl,fd,el|fsl|E|080808,F5F5F5,E03838,202020;F8E0E0,141414,E08068,E08080;080808,F5F5F5,FDFDFD,383838;F8F8E0,141414,503820,F8F8F8',
'Heron|books|modern|cl,ho,se,fd,be|fs|B|F8F8F8,141414,2080F8,E0E0E0;F8F8F8,141414,986850,E0E0E0;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Hibiscus|beauty|soft|cl,bg,be,je|fsl|C|F8F8F8,141414,F85038,E0E0E0;F8F8F8,141414,805038,E0E0E0;F8F8F8,141414,683820,E0E0E0;F8E0E0,141414,141414,F8F8F8',
'Hickory|tech|modern|cl,to,je,el|sl|F|F8F8F8,141414,6D5139,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Hollyhock|bags|lux|sp,cl,ho,bg,be|fs|B|E0E0E0,141414,1C1C1C,F2F2F2;F8F8E0,141414,1A1A1A,E0F850;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,141414,809898',
'Honeycomb|bags|soft|cl,bg,fd|s|C|F8F8F8,141414,382008,E0E0E0;E0E0E0,141414,1C1C1C,F8F8F8',
'Hornbeam|drinks|soft|ho,fd,be,je,pe|sl|H|F8F8F8,141414,808038,E0E0C8;F8F8F8,141414,503820,E0E0E0;F8F8F8,141414,1C1C1C,E0E0F8',
'Huckleberry|home|bold|cl,ho,bg,fd,ar|s|B|F8F8F8,141414,322822,B0B0B0;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Hyacinth|kids|soft|ki,pe|sl|H|F8F8F8,141414,083898,E0E0E0;F8F8F8,141414,B05038,F8F8E0;F8F8F8,141414,088080,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Ibis|beauty|bold|sp,ho,ar,be,je|s|E|F8F8F8,141414,553B22,F2F2F2;F8F8F8,141414,382008,F2F2F2;F8F8F8,141414,385068,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Ironbark|men|lux|cl,sh,be|s|B|F8F8F8,141414,C88050,F8E0B0;F8F8F8,141414,1C1C1C,E0E0E0',
'Ivybridge|home|editorial|cl,ho,bg,be,je|s|C|F8F8F8,141414,683820,F2F2F2;E0E0E0,141414,141414,F8F8E0;F8F8F8,141414,141414,C8C8B0',
'Jacaranda|beauty|lux|cl,ho,be|s|F|F8F8F8,141414,D97D64,B0B0B0;F8F8F8,141414,683820,989898;F8F8F8,141414,1C1C1C,E0E0E0',
'Jasper|auto|bold|au,of,ki,el,pe|sl|B|F8F8F8,141414,435176,E0E0E0;F8F8F8,141414,6880B0,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Jonquil|jewel|modern|cl,fd,ga,je|f|C|F8F8F8,141414,D47B62,E08068;F8F8F8,141414,C89880,F2F2F2;F8F8F8,141414,805038,F8F8E0',
'Kelp|tech|editorial|en,ki,to,pe|s|E|F8F8F8,141414,6F5239,E0E0E0;F8F8F8,141414,1A1A1A,F8E0E0;F8F8F8,141414,141414,F8E0E0',
'Kestrelwood|tech|modern|cl,ho,el,pe|fsl|B|F8F8F8,141414,085098,E0E0E0;F8F8F8,141414,C86868,E0E0E0;F8F8F8,141414,503820,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Kingfisher|fashion|bold|sp,cl,bg,be,je|l|H|080808,F5F5F5,F8F6F5,222222;F8F8F8,141414,380808,E0E0E0;F8F8F8,141414,806850,F2F2F2',
'Kumquat|home|bold|cl,ho,be,je|s|E|F8F8F8,141414,96664D,E0E0E0;F8F8F8,141414,806850,E0E0E0;F8F8F8,141414,B09880,B09898;F8F8F8,141414,141414,E0E0E0',
'Lacewing|bags|modern|sp,cl,bg|s|B|E0E0E0,141414,806850,F8F8F8;F8F8F8,141414,1C1C1C,E0E0E0',
'Lagoon|tech|editorial|sp,cl,en,be,je|s|D|F8F8F8,141414,AD7D64,F2F2F2;F8F8F8,141414,6880B0,E0E0E0;F8F8F8,141414,806850,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Lapwing|fashion|soft|cl,je|s|E|F8F8F8,141414,3B2D25,F2F2F2',
'Larkspur|books|modern|cl,ho,ar,be,je|ofsl|B|C8C8C8,141414,685038,F2F2F2;C8C8C8,141414,685038,F8F8F8;F8F8F8,141414,C89880,E0E0E0;F8F8F8,141414,B09880,E0E0E0',
'Lavandin|home|editorial|ho,we,bg,be,je|sl|C|F8F8F8,141414,683808,F2F2F2',
'Ledger|books|lux|ho,ar,je|s|E|F8F8F8,141414,68B0B0,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Lichen|fashion|modern|cl,ho,je|sl|B|F8F8F8,141414,C85080,B0B0B0;F8F8F8,141414,500808,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2',
'Lilac|beauty|lux|cl,se,fd,be,je|fs|C|E0E0E0,141414,988068,C8C8C8;F8E0E0,141414,988068,E0E0E0;F8F8F8,141414,382008,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2',
'Limestone|pets|modern|we,ki,ar,be,pe|s|E|E0F8F8,141414,C89868,F8F8F8;F8F8F8,141414,B08068,E0E0E0;F8F8F8,141414,085038,E0E0E0',
'Linden|pets|bold|ho,sh,pe|sl|H|F8F8F8,141414,1A1A1A,C8E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Linnet|tech|modern|cl,to,ar,el|s|C|F8E0B0,141414,685038,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,141414,F8E0E0',
'Loch|tech|bold|cl,en,fd,ar,je|sl|H|F8F8F8,141414,443228,F2F2F2;F8F8F8,141414,1C1C1C,C8C8C8;F8F8F8,141414,1C1C1C,989898;F8F8F8,141414,141414,E0E0E0',
'Lotus|food|modern|cl,fd|s|A|E0E0E0,141414,B08050,F8F8F8;F8F8F8,141414,685038,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Lupin|bags|editorial|cl,ho,bg,je|s|C|F8F8F8,141414,1E2221,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Macaw|men|bold|cl,bg,sh,be|s|E|202020,F5F5F5,806850,222222;F8F8F8,141414,502008,E0E0E0;F8F8F8,141414,508098,B09880;F8F8F8,141414,141414,E0B0B0',
'Madder|fashion|lux|cl,bg,sh,fd,be|fsl|B|202020,F5F5F5,F8F6F5,383838;F8F8F8,141414,806898,B0B0B0;F8F8F8,141414,141414,F8B008',
'Mallow|books|lux|cl,ho,ar|fs|C|F8F8F8,141414,806838,F2F2F2;F8F8F8,141414,082038,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Mandarin|bags|bold|cl,we,bg,ar|s|F|F8F8F8,141414,967B62,989898;F8F8F8,141414,1C1C1C,E0E0E0',
'Mangrove|auto|lux|sp,cl,ho,hw,sh|fs|B|202020,F5F5F5,F4F1EE,080808;202020,F5F5F5,FDFDFD,222222;F8F8F8,141414,1C1C1C,C8C8C8;F8F8F8,141414,1C1C1C,F2F2F2',
'Maple|jewel|lux|cl,be,je,el,pe|l|H|F8F8F8,141414,50B080,E0E0C8;F8F8F8,141414,083820,E0E0E0;F8F8F8,141414,1A1A1A,F8F8E0;F8F8F8,141414,141414,C8E0F8',
'Marram|pets|lux|ho,we,fd,ar,pe|f|F|F8F8F8,141414,583D24,E0E0E0;F8F8F8,141414,B09880,E0E0E0;F8F8E0,141414,141414,F2F2F2;F8F8F8,141414,141414,F8E0C8',
'Marshmallow|home|modern|sp,cl,ho,be|s|B|F8F8F8,141414,5C3F26,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,989898',
'Martin|beauty|editorial|cl,ho,ki,be,je|s|C|808080,F5F5F5,382008,222222;F8F8F8,141414,205080,F8E0E0;F8F8F8,141414,805020,E0E0E0;F8F8F8,141414,141414,988080',
'Meadowsweet|drinks|modern|cl,ho,fd,to,be|sl|H|F8F8F8,141414,E09820,F8E0C8;F8F8F8,141414,3838F8,F2F2F2;F8F8F8,141414,802020,E0E0E0;200808,F5F5F5,FFFFFF,222222',
'Merlin|home|modern|sp,cl,ho,be|s|A|F8F8F8,141414,1F2725,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Mica|fashion|modern|cl,be|s|C|F8F8F8,141414,F86820,F2F2F2;F8F8F8,141414,805038,B0B0B0',
'Millet|fashion|bold|cl|f|E|202020,F5F5F5,F5F5F5,080808;F8F8E0,141414,988068,C8C8C8',
'Mimosa|kids|bold|cl,ga,to,ar,be|sl|H|080808,F5F5F5,B00808,080820;F8F8F8,141414,0820B0,F2F2F2;F8F8F8,141414,C83838,E09880;F8F8F8,141414,506838,E0E0E0',
'Minnow|tech|lux|cl,ho,of,en,ar|fs|C|080808,F5F5F5,F4F1EE,222222;C8C8C8,141414,1C1C1C,989898;C8B098,141414,141414,C8B0B0;F8F8F8,141414,1C1C1C,C8C8C8',
'Mistletoe|sport|editorial|sp,el,pe|ofs|F|F8F8E0,141414,082068,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0',
'Moorland|books|soft|cl,ho,ar|ofsl|B|F8F8F8,141414,982020,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Morel|bags|modern|cl,ho,bg,be|s|D|F8F8F8,141414,95785F,E0E0E0;F8F8F8,141414,1C1C1C,989898;F8F8F8,141414,1C1C1C,E0E0E0',
'Mulberry|kids|modern|hw,to,ar,je,pe|sl|E|F8F8F8,141414,82654C,E0E0E0;F8F8F8,141414,141414,F8F8E0;E0E0E0,141414,1C1C1C,C8C8C8;F8F8F8,141414,141414,E0E0E0',
'Myrtle|fashion|bold|cl,be,el|sl|H|F8F8F8,141414,803820,E0E0E0;685038,F5F5F5,F5F5F5,806850;F8F8F8,141414,1C1C1C,F2F2F2',
'Nettle|bags|editorial|cl,ho,bg|s|C|F8F8F8,141414,C89880,F2F2F2;E0E0E0,141414,1C1C1C,C8C8E0',
'Nightjar|jewel|lux|cl,be,je|s|E|F8F8F8,141414,6B3B22,F2F2F2;F8F8F8,141414,141414,F2F2F2',
'Nutmeg|beauty|soft|fd,ga,ki,be|fs|A|B0C8C8,141414,141414,F8F8F8;F8F8E0,141414,8080B0,E0E0E0',
'Oakmoss|food|soft|cl,hw,fd|l|H|F8F8F8,141414,E02008,F2F2F2',
'Olivine|fashion|bold|sp,cl,ar|s|F|F8F8F8,141414,202C29,C8C8C8;E0C8B0,141414,141414,F8F8F8',
'Orrin|beauty|bold|sp,be|l|H|F8F8F8,141414,082050,E0F8F8;F8F8F8,141414,1C1C1C,F2F2F2',
'Osprey|home|editorial|ho,ar|s|D|202020,F5F5F5,F1EBE8,080808;F8F8F8,141414,8098B0,E0E0E0;E0E0E0,141414,141414,F8F8F8',
'Otterburn|jewel|lux|cl,je,el|sl|H|F8F8F8,141414,12254E,C8C8E0;F8F8F8,141414,082038,F2F2F2',
'Paprika|sport|soft|sp,cl,ho,ga,el|sl|B|F8F8F8,141414,205098,E0E0E0;F8F8F8,141414,C880B0,E0E0E0;F8F8F8,141414,986868,F8E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Papyrus|fashion|bold|sp,cl,be|l|H|F8F8F8,141414,AB7B62,F2F2F2;F8F8F8,141414,141414,C8B098',
'Parsley|food|bold|cl,hw,fd,ki,el|sl|E|F8F8E0,141414,6850B0,F2F2F2;F8F8F8,141414,1A1A1A,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Partridge|men|bold|au,en,sh,el|l|H|F8F8F8,141414,2050B0,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2',
'Pecan|fashion|modern|cl,ho,el,pe|s|C|F8F8F8,141414,3F250C,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0',
'Pelican|fashion|modern|cl,bg,be|s|E|F8F8F8,141414,B06850,E0E0E0;F8F8F8,141414,685038,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Peppercorn|home|modern|cl,ho,we,je|sl|B|F8F8F8,141414,6B93BD,F8E0E0;F8F8F8,141414,505020,F2F2F2;F8F8F8,141414,1C1C1C,989898',
'Periwinkle|beauty|soft|sp,cl,be,el,pe|s|C|F8F8F8,141414,680808,F2F2F2;988068,F5F5F5,F5F5F5,806850;F8F8F8,141414,382008,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2',
'Persimmon|kids|soft|sp,ho,to,el,pe|s|E|F8F8F8,141414,C85050,F8F8E0;F8F8F8,141414,B03838,F8F8E0;F8F8E0,141414,B09880,E0E0C8;F8F8F8,141414,385068,F2F2F2',
'Petrel|home|editorial|sp,ho,of,el|sl|H|F8F8F8,141414,21332E,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Pinecone|fashion|editorial|cl,of,to|fs|C|E0E0E0,141414,980808,F2F2F2;F8F8F8,141414,805050,E0E0E0',
'Pipit|sport|bold|sp,cl|sl|H|F8F8F8,141414,F83868,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Plover|fashion|modern|cl,ho,to|sl|B|F8F8F8,141414,E02038,F2F2F2;F8F8F8,141414,0868B0,F2F2F2',
'Plum|pets|modern|sp,cl,je,el,pe|sl|H|202020,F5F5F5,B02020,383838;F8F8F8,141414,9898C8,E0E0F8;F8F8F8,141414,B08080,B08080;F8F8F8,141414,1C1C1C,C8C8C8',
'Puffin|books|soft|au,of,en,hw,el|sl|F|F8F8F8,141414,125191,F2F2F2;F8F8F8,141414,503820,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0;E0E0E0,141414,1C1C1C,E0E0C8',
'Pumice|jewel|modern|sp,cl,je|s|B|F8F8F8,141414,08B0F8,E0E0E0;F8F8F8,141414,503880,F2F2F2',
'Quince|books|modern|ho,ar,be|s|D|F8E0E0,141414,C88068,E0C8B0',
'Raffia|home|editorial|cl,ho,fd,be|s|E|F8F8F8,141414,AD937B,E0E0E0;F8F8F8,141414,1C1C1C,C8C8C8',
'Ragwort|beauty|lux|sp,cl,sh,be|fl|B|F8F8F8,141414,95654C,E0E0E0;F8F8F8,141414,385080,C8C8C8;F8F8F8,141414,1C1C1C,989898',
'Rattan|fashion|modern|cl,bg,ki|s|C|F8F8F8,141414,C3937B,E0E0E0;202020,F5F5F5,FDFDFD,080808;F8F8F8,141414,B09880,C8C8C8',
'Raven|fashion|modern|cl,of,bg|sl|E|E0E0E0,141414,F83820,F8F8F8;C8C8C8,141414,988068,F8F8F8',
'Redwing|men|modern|cl,bg,sh,be,je|s|B|F8F8F8,141414,386898,E0E0E0;F8F8F8,141414,B08050,E0E0E0;F8F8F8,141414,B08050,F2F2F2;F8F8F8,141414,685020,E0E0E0;F8F8F8,141414,385068,F2F2F2',
'Reedbed|men|bold|sp,bg,sh,je,el|s|C|202020,F5F5F5,F1EFED,503820;F8F8F8,141414,685038,F2F2F2;F8F8F8,141414,B09880,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Rhubarb|home|modern|au,sp,ho,we,hw|l|H|F8F8F8,141414,B09868,F2F2F2;F8F8F8,141414,082038,F2F2F2',
'Rockrose|garden|lux|cl,ga,ar,je|s|B|E0F8E0,141414,1C1C1C,B0B0B0;F8F8F8,141414,1C1C1C,E0E0E0',
'Rosehip|books|bold|cl,of,ar|ofs|C|E0E0E0,141414,205098,F8F8F8;383820,F5F5F5,FDFDFD,505038',
'Rowan|pets|lux|cl,be,pe|s|E|083820,F5F5F5,806850,222222',
'Ruffle|jewel|soft|cl,be,je|s|B|F8F8E0,141414,B08068,F8F8F8',
'Rushmoor|beauty|editorial|sp,we,bg,be,je|fs|C|F8F8F8,141414,0898E0,E0E0E0;F8F8F8,141414,B06850,F8E0E0',
'Russet|jewel|soft|cl,be,je|sl|H|F8F8F8,141414,2C221C,B0C8C8;F8E0F8,141414,141414,C8C8C8',
'Sagebrush|jewel|lux|cl,ki,to,je|sl|A|F8F8F8,141414,F880B0,C8E0F8;202020,F5F5F5,FDFDFD,080808;F8F8F8,141414,1C1C1C,E0E0E0',
'Samphire|jewel|soft|cl,ho,je|s|C|E0E0E0,141414,986850,C8C8C8;F8F8F8,141414,988068,E0E0E0',
'Sandpiper|books|soft|we,ki,to,ar,pe|s|E|F8F8F8,141414,233934,F8E0E0',
'Sapling|auto|bold|au,cl,el|sl|H|F8F8F8,141414,500808,E0E0E0;F8F8F8,141414,1A1A1A,F2F2F2',
'Sassafras|sport|bold|sp,cl,we,fd,el|s|C|F8F8F8,141414,12517B,E0E0E0;98B0B0,141414,141414,C8C8C8;F8F8F8,141414,382008,E0E0E0;F8F8F8,141414,8098B0,9898B0;F8F8F8,141414,1C1C1C,F2F2F2',
'Scallop|fashion|editorial|sp,cl,fd,be,el|s|E|F8F8F8,141414,086898,F2F2F2;F8F8F8,141414,C86838,E0E0E0;F8F8F8,141414,C89868,989898;F8F8F8,141414,688098,808098;F8F8F8,141414,1C1C1C,F2F2F2',
'Seagrass|fashion|editorial|cl,pe|fs|B|F8F8F8,141414,5080F8,5080F8;F8F8F8,141414,6898B0,E0E0E0',
'Sedge|fashion|soft|cl,bg,be,je|l|H|F8F8F8,141414,E09850,F2F2F2;F8F8F8,141414,805038,F2F2F2;F8F8F8,141414,B08068,C8B098;080808,F5F5F5,F5F5F5,222222',
'Sequoia|food|soft|fd,ki|s|E|F8E0E0,141414,803808,F2F2F2;F8F8F8,141414,682008,808098',
'Shingle|drinks|soft|of,we,fd|s|B|F8F8F8,141414,083820,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1A1A1A,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Silverbirch|fashion|lux|cl,sh,ki,be,je|s|C|F8F8F8,141414,83644A,F2F2F2;F8F8F8,141414,685038,F2F2F2;E0E0E0,141414,1C1C1C,F8F8F8;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,F8E0E0',
'Siskin|fashion|lux|sp,cl,be|s|E|080808,F5F5F5,E06820,202038;F8F8F8,141414,E09808,E09808;F8F8F8,141414,803820,E0E0E0',
'Skylark|home|editorial|cl,ho,of,bg,el|osl|B|F8F8F8,141414,12A9E9,08B0F8;F8F8F8,141414,08B098,E0E0E0;080808,F5F5F5,FDFDFD,222222;F8F8F8,141414,688098,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Sloe|tech|editorial|cl,fd,be,je,el|l|H|F8F8F8,141414,F88098,F898B0;F8F8F8,141414,3868B0,F2F2F2;F8F8F8,141414,805008,F2F2F2;F8F8F8,141414,506838,F2F2F2;F8F8F8,141414,141414,E0C868',
'Snowdrop|beauty|soft|cl,fd,be|fl|F|F8F8F8,141414,A8785F,E0E0E0;080808,F5F5F5,FDFDFD,222222;F8F8F8,141414,1C1C1C,B0B0B0',
'Sorbet|fashion|lux|au,cl,ga,be|sl|H|E0E0E0,141414,385020,F8F8F8;F8F8F8,141414,141414,E0C8C8;F8C838,141414,1A1A1A,F8C850',
'Sparrow|beauty|lux|cl,bg,be,je,el|l|H|F8F8F8,141414,C86838,F8E0E0;F8F8F8,141414,203898,E0E0E0;F8F8F8,141414,B09868,E0E0E0;F8F8F8,141414,382008,E0E0C8;F8F8F8,141414,1C1C1C,E0E0E0',
'Spruce|fashion|editorial|cl,bg,sh,be,je|s|E|F8F8F8,141414,604228,F2F2F2;F8F8F8,141414,505020,F2F2F2;F8F8F8,141414,806850,E0E0E0;F8F8F8,141414,1C1C1C,989898;F8F8E0,141414,1C1C1C,F8F8F8',
'Starling|fashion|editorial|cl,bg,ki,be,je|s|B|F8F8F8,141414,3F6791,F2F2F2;F8F8F8,141414,988068,E0E0E0;F8F8F8,141414,988068,F2F2F2;F8F8F8,141414,505020,F2F2F2;F8F8F8,141414,382008,F2F2F2',
'Stonecrop|men|bold|cl,of,sh,be|s|C|F8F8F8,141414,A5755C,B08080;F8F8F8,141414,988068,988068;F8F8F8,141414,141414,E0E0C8;F8F8F8,141414,1C1C1C,E0E0E0',
'Sumacleaf|fashion|lux|cl,be,je|s|E|080808,F5F5F5,FFFFFF,382008;F8E0E0,141414,988068,F2F2F2;F8F8F8,141414,806850,F2F2F2',
'Sunflower|kids|bold|cl,ki|s|B|080808,F5F5F5,B03820,500808;F8F8F8,141414,203808,E0E0E0',
'Swallow|fashion|lux|cl,ga,ar,je|sl|D|080808,F5F5F5,F1EBE8,222222;F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,1C1C1C,C8C8C8',
'Sweetgum|fashion|bold|cl,je|s|E|B0B0B0,141414,506898,688098;B0B0B0,141414,685038,F2F2F2;806850,F5F5F5,FFFFFF,503838;988068,F5F5F5,FFFFFF,222222;B09880,F5F5F5,F5F5F5,685038',
'Sycamore|jewel|lux|ga,ki,to,je,pe|s|B|F8F8F8,141414,C85038,F8F8E0;F8F8F8,141414,805020,F2F2F2;F8F8F8,141414,683820,8098B0;F8F8F8,141414,508098,E0E0E0;F8F8F8,141414,806850,E0E0E0',
'Tansy|pets|modern|ki,to,pe|fs|C|F8F8F8,141414,F83820,F83820;F8F8F8,141414,683808,F8F8E0;C8E068,141414,1A1A1A,F8F8F8',
'Tarragon|beauty|soft|cl,en,fd,be,je|sl|E|F8F8F8,141414,815139,F8F8E0;F8F8F8,141414,806850,E0E0E0;F8F8F8,141414,685038,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,141414,F8E0E0',
'Teasel|food|lux|fd,be|fs|B|F8F8F8,141414,1A284D,F2F2F2;F8F8F8,141414,141414,F8E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Thatch|jewel|lux|sp,cl,ki,be,je|s|C|E0E0E0,141414,800808,F8F8F8;F8F8F8,141414,C88068,988068;F8F8F8,141414,B06850,F2F2F2;F8F8F8,141414,686838,989898;F8F8F8,141414,1C1C1C,989898',
'Thornbury|home|modern|ho,of,hw,ga,ar|l|H|F8F8F8,141414,AB8F76,E0E0E0;F8F8F8,141414,383808,B0B0B0;F8F8F8,141414,806850,F2F2F2;F8F8F8,141414,141414,F2F2F2;F8F8F8,141414,1C1C1C,808080',
'Thrush|fashion|modern|cl,ga,ki,ar,pe|sl|B|F8F8F8,141414,E05008,F8F8E0;F8F8F8,141414,0868B0,F2F2F2;F8F8F8,141414,689850,E0E0C8;F8F8F8,141414,1A1A1A,C8E0F8;F8F8F8,141414,1C1C1C,F2F2F2',
'Thyme|sport|modern|sp,of,hw,fd,ga|sl|H|F8F8F8,141414,E00820,F2F2F2;F8F8F8,141414,986868,F8F8E0;F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,141414,F8C820',
'Timber|books|soft|ho,se,we,fd|ofs|E|F8F8E0,141414,C86868,F8E0E0;F8F8E0,141414,805038,B09880;F8F8F8,141414,382008,F2F2F2;F8F8E0,141414,503820,F8E0E0',
'Topaz|men|bold|sh,be|s|B|F8F8F8,141414,5098E0,E0E0E0;F8F8F8,141414,B08050,F2F2F2',
'Tourmaline|beauty|soft|cl,ar,be|s|D|F8F8E0,141414,683808,E0E0E0;080808,F5F5F5,F5F5F5,202020;F8F8F8,141414,382008,F2F2F2',
'Travertine|sport|bold|sp,cl,ki,be|s|E|F8F8F8,141414,F88038,E0E0E0;F8F8F8,141414,806838,E0E0E0;F8F8F8,141414,986850,E0C8C8;F8F8F8,141414,8098C8,B0B0B0;F8F8F8,141414,141414,F8C880',
'Trefoil|food|modern|sp,fd,be,el,pe|s|B|F8F8F8,141414,F88050,F8E0E0;F8F8F8,141414,6898B0,B0B0B0;2068E0,F5F5F5,FFFFFF,222222;F8F8F8,141414,1A1A1A,F8E008;F8F8F8,141414,141414,F8E0E0',
'Tulip|fashion|bold|cl,el|s|C|F8F8F8,141414,94755C,988068;F8F8F8,141414,503868,E0E0E0',
'Tupelo|food|modern|fd|l|H|F8F8F8,141414,1E1F2A,E0E0E0',
'Turmeric|fashion|modern|sp,cl|s|B|F8F8F8,141414,12677B,F8F8E0;080808,F5F5F5,FDFDFD,202020',
'Twine|tech|soft|cl,ho,hw,el|l|H|F8F8F8,141414,3868E0,E0E0E0;F8F8F8,141414,680820,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Umber|home|lux|ho,ga|s|F|382020,F5F5F5,C8B098,080808;082038,F5F5F5,386850,385050;F8F8F8,141414,1C1C1C,808080',
'Valerian|jewel|editorial|en,bg,to,ar,je|fs|B|F8F8F8,141414,F82080,F2F2F2;080808,F5F5F5,FDFDFD,202020;F83880,F5F5F5,FFFFFF,080808;080808,F5F5F5,FDFDFD,383838;E0F838,141414,1A1A1A,F2F2F2',
'Verbena|jewel|lux|cl,ho,we,je|s|D|F8F8F8,141414,AD9364,E0E0E0;F8F8F8,141414,685038,989898;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,989880;F8F8F8,141414,1C1C1C,E0E0E0',
'Vetiver|fashion|lux|cl|s|E|F8F8F8,141414,AB8F62,E0E0E0;F8F8F8,141414,B08080,9898B0',
'Violet|tech|bold|sp,el|l|H|202020,F5F5F5,F86808,080808;F8F8F8,141414,141414,F8F8E0',
'Wagtail|beauty|bold|fd,be,je|s|D|F8F8F8,141414,6D8FB4,6898C8;F8F8F8,141414,508098,F8F8E0;080808,F5F5F5,F5F5F5,222222;F8F8F8,141414,141414,F8F8E0',
'Walnut|fashion|lux|sp,cl,sh|sl|H|F8F8F8,141414,1F2234,E0E0E0;F8F8E0,141414,1C1C1C,E0E0C8;F8F8E0,141414,1C1C1C,F8E0E0;F8F8F8,141414,141414,E0E0E0',
'Warbler|fashion|soft|cl|s|A|F8F8F8,141414,21243F,E0E0E0',
'Waxwing|fashion|modern|cl,fd,be|s|C|F8F8F8,141414,55250C,E0E0E0;080808,F5F5F5,FDFDFD,222222;E0E0E0,141414,685038,F8F8F8',
'Wheatear|home|modern|ho,fd,el|s|E|F8F8F8,141414,43280F,E0E0E0;F8F8F8,141414,386850,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0',
'Whinchat|fashion|lux|cl,ho,be,je|l|H|F8F8E0,141414,E05008,F8F8F8;F8F8E0,141414,E050B0,F8E0E0;F8F8F8,141414,685020,F8F8E0;F8F8F8,141414,B08068,F8E0E0;F8F8F8,141414,1C1C1C,989898',
'Whitebeam|sport|modern|sp,bg,sh,je,el|s|C|F8F8F8,141414,685020,F2F2F2;080808,F5F5F5,FDFDFD,222222;F8F8F8,141414,503820,E0E0E0;F8F8F8,141414,806850,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Wicker|tech|bold|au,en,to,be,el|s|F|202020,F5F5F5,985038,383838;F8F8F8,141414,980808,E0E0E0;F8F8F8,141414,C89838,E0F8F8;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,F8F8E0',
'Wildflower|beauty|modern|sp,cl,be|s|B|F8F8F8,141414,94644A,B09898;080808,F5F5F5,FDFDFD,202020;F8F8F8,141414,806850,F2F2F2',
'Willowherb|jewel|lux|bg,be,je,el|fs|C|F8F8F8,141414,AB7B4D,988080;080808,F5F5F5,F5F5F5,202020;F8F8F8,141414,1C1C1C,F2F2F2;E0F8F8,141414,1C1C1C,F8F8F8',
'Wisteria|jewel|lux|cl,ho,je|s|E|E0E0E0,141414,AD7D4E,F8F8F8;808080,F5F5F5,FFFFFF,222222;F8F8F8,141414,382008,F2F2F2',
'Woodlark|fashion|modern|cl|of|B|F8F8F8,141414,6868E0,6898B0;F8F8F8,141414,986850,E0E0E0;F8F8F8,141414,1A1A1A,C8C8C8',
'Wormwood|sport|bold|au,sp,ga,je,el|sl|C|080808,F5F5F5,B14129,222222;F8F8F8,141414,0850C8,F2F2F2;F8F8F8,141414,680808,F2F2F2;F8F8F8,141414,682038,E0E0E0;F8F8F8,141414,141414,F2F2F2',
'Yarrow|drinks|editorial|fd,ga,be|s|E|E0E0E0,141414,688020,F8F8F8;202038,F5F5F5,FDFDFD,222222;F8F8E0,141414,503820,F8F8F8;F8F8F8,141414,689880,E0E0C8;F8F8F8,141414,1C1C1C,E0E0E0',
'Yew|tech|editorial|ho,en,we,ar|fl|A|F8F8F8,141414,6B3B0C,F2F2F2;080808,F5F5F5,FDFDFD,202020;F8F8F8,141414,503820,F8F8E0;F8F8F8,141414,1C1C1C,F8F8E0;F8F8F8,141414,1C1C1C,B0B0B0',
'Zinnia|pets|modern|ho,el,pe|l|H|F8F8F8,141414,809850,E0E0E0;F8F8F8,141414,806850,E0E0E0',
'Acorn|tech|editorial|se,en,we|f|E|F8F8F8,141414,985020,C8C8C8;F8F8F8,141414,383868,F2F2F2;F8F8F8,141414,B09880,B09880',
'Agate|fashion|modern|cl,fd,je|s|B|F8F8F8,141414,500820,F2F2F2;F8F8F8,141414,988068,E0E0E0',
'Alcove|fashion|bold|cl,bg,sh,be|sl|C|F8F8F8,141414,C82020,B0C8E0;F8F8F8,141414,683820,E0E0E0;F8F8F8,141414,1C1C1C,988080;E0E0E0,141414,1C1C1C,F8F8F8;F8F8F8,141414,141414,F89808',
'Almond|fashion|lux|cl,bg,be,je|ofs|E|080808,F5F5F5,809838,202020;F8F8F8,141414,988068,988068;E0F8B0,141414,1A1A1A,E0F880;F8F8F8,141414,141414,E0E0E0',
'Anchor|beauty|lux|au,sp,cl,be,je|sl|B|F8F8F8,141414,685008,F2F2F2;F8F8F8,141414,141414,F2F2F2;F8F8F8,141414,1C1C1C,E0F8E0;F8F8F8,141414,141414,F8F8E0;F8F8F8,141414,1C1C1C,B0B0B0',
'Anvil|auto|modern|ho,hw,fd,ga,pe|sl|H|F8F8F8,141414,2080C8,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,141414,C8B098;F8F8F8,141414,1C1C1C,E0E0E0',
'Apiary|sport|modern|sp,cl,bg,sh|s|E|F8F8F8,141414,082038,E0E0E0;F8F8F8,141414,141414,E0E0E0;E0E0E0,141414,141414,F8E0E0;F8E0C8,141414,1C1C1C,E0E0C8',
'Arcadian|home|modern|cl,ho,be,je,el|s|B|F8F8F8,141414,65442A,F8E0E0;F8F8F8,141414,806850,B0B0B0;F8F8F8,141414,988068,988068;F8F8F8,141414,806850,F8F8E0;F8F8F8,141414,141414,F2F2F2',
'Awning|kids|soft|cl,we,ki,to,be|sl|C|F8F8F8,141414,D97D4E,E08050;F8F8F8,141414,503820,F2F2F2;F8F8F8,141414,141414,F8B0B0;F8F8F8,141414,141414,F8F8E0;F8E0E0,141414,1A1A1A,F8F8E0',
'Bayou|fashion|lux|cl,sh,ki,be,je|s|E|F8F8F8,141414,BF8F76,F2F2F2;809898,F5F5F5,F5F5F5,202020;F8F8F8,141414,806850,B0B0B0;F8F8F8,141414,988068,989898;F8F8F8,141414,806850,E0E0E0',
'Beaconhill|fashion|lux|cl,ho|s|B|F8F8F8,141414,22284C,C8C8C8',
'Bellows|kids|soft|ki,be,el|sl|H|F8F8F8,141414,805020,F2F2F2;F8F8F8,141414,805038,E0E0E0;F8F8F8,141414,141414,F8C8C8',
'Billow|jewel|lux|ho,of,en,je,el|l|H|F8F8F8,141414,825239,B0B0B0;080808,F5F5F5,FDFDFD,202020;E0E0E0,141414,082038,C8C8C8;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Boulder|food|modern|fd|s|B|F8F8F8,141414,E03850,E0E0E0;F8F8F8,141414,5068E0,F2F2F2',
'Bower|home|lux|cl,ho,of|fl|C|F8F8E0,141414,685038,F8F8F8;F8F8F8,141414,B09880,E0E0E0',
'Breakwater|jewel|lux|se,of,fd,je,el|ofsl|F|F8F8F8,141414,D48F0F,F2F2F2;202020,F5F5F5,206850,222222;080808,F5F5F5,FFFFFF,202020;F8F8F8,141414,503820,F2F2F2;F8F8F8,141414,141414,F8E098',
'Brigantine|books|editorial|we,bg,fd,ar,el|sl|B|F8F8F8,141414,B02020,F8E0E0;F8F8F8,141414,085050,E0E0E0;F8F8F8,141414,080838,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2;F8F8F8,141414,1A1A1A,F2F2F2',
'Broadleaf|fashion|bold|sp,cl,ho,be,je|l|H|F8F8F8,141414,C35138,E0E0E0;F8F8F8,141414,382080,E0E0E0;F8F8F8,141414,083838,E0E0E0;F8F8F8,141414,141414,E0E0E0;E0E0E0,141414,141414,F8F8F8',
'Buckwheat|sport|bold|sp,cl,se,bg|sl|E|F8F8F8,141414,6D3D24,E0E0E0;F8F8F8,141414,68B0B0,E0E0E0;F8F8F8,141414,382008,E0E0E0;F8F8F8,141414,1C1C1C,F8E0E0',
'Bulrush|fashion|lux|cl,ho,bg|s|B|E0E0E0,141414,805020,E0F8E0;805020,F5F5F5,FFFFFF,222222;F8F8F8,141414,806850,E0E0E0;F8F8E0,141414,1C1C1C,F2F2F2',
'Cairn|home|lux|ho,of,be|s|C|202020,F5F5F5,EDEAE7,080808;F8F8F8,141414,988068,988068;F8F8F8,141414,988068,B09898',
'Calyx|bags|modern|ho,bg,be|os|F|F8F8F8,141414,988050,C8C8C8;F8F8F8,141414,988068,B09898;F8F8F8,141414,1C1C1C,F2F2F2',
'Camellia|jewel|lux|cl,en,fd,be,je|s|B|F8F8F8,141414,A27258,E0E0E0;E0E0E0,141414,988068,F8F8F8;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,F8F8E0',
'Campfire|home|modern|au,cl,ho,ga,je|l|H|080808,F5F5F5,B19982,222222;F8F8F8,141414,1C1C1C,E0E0E0;E0E0E0,141414,141414,F8F8F8;F8F8F8,141414,1C1C1C,F2F2F2',
'Caravan|books|bold|cl,se|sl|E|F8F8F8,141414,980808,E0E0E0;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Carousel|men|bold|ho,se,sh,pe|sl|H|202020,F5F5F5,B00808,B00808;F8F8F8,141414,0838E0,E0E0E0;F8F8F8,141414,2050C8,5098B0;F8F8F8,141414,802038,B0C8C8;F8F8F8,141414,1C1C1C,E0E0E0',
'Causeway|sport|bold|sp,be|l|H|F8F8F8,141414,206898,F8E0E0',
'Chalk|fashion|lux|cl,sh,to,pe|s|E|F8F8F8,141414,B03838,C8C8C8;F8F8F8,141414,141414,B0B0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Chapel|kids|soft|cl,ki,ar,je,pe|ofsl|B|F8F8F8,141414,835339,988068;F8F8F8,141414,986850,E0E0E0;F8F8E0,141414,988068,988068;F8F8F8,141414,141414,E0C8B0',
'Cobble|books|lux|cl,sh,fd,ar,je|s|C|E0E0E0,141414,815122,F2F2F2;F8F8F8,141414,506880,E0E0E0;E0E0E0,141414,506880,F8F8F8;F8F8F8,141414,141414,E0E0E0',
'Comet|beauty|lux|cl,ho,be|l|H|F8F8F8,141414,E09868,F2F2F2;B0C8C8,141414,1C1C1C,F8F8F8',
'Coppice|jewel|lux|cl,be,je|sl|H|F8F8F8,141414,C83808,F2F2F2;F8F8F8,141414,141414,E0E0E0',
'Corbel|sport|bold|sp,we,fd,be,pe|sl|C|F8F8F8,141414,D9934E,F8B098;F8F8F8,141414,388080,F2F2F2;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,141414,C8C8F8',
'Cornice|beauty|modern|sp,we,be|s|F|F8F8F8,141414,2068B0,F2F2F2;F8F8F8,141414,988068,E0E0E0',
'Cove|kids|lux|ho,ki,el,pe|sl|B|F8F8F8,141414,242B5A,E0E0E0;F8F8F8,141414,1C1C1C,E0E0F8;F8F8F8,141414,1C1C1C,F2F2F2',
'Crag|tech|bold|cl,be,je,el|l|H|F8F8F8,141414,BC8C72,F8E0E0;F8F8F8,141414,805038,F2F2F2;F8F8F8,141414,688098,688098;F8F8F8,141414,141414,F2F2F2',
'Crescent|home|bold|ho,be,pe|ofs|F|F8F8F8,141414,846349,E0C8C8;F8F8F8,141414,1C1C1C,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Croft|jewel|modern|je|o|G|F8F8F8,141414,28201E,F2F2F2',
'Crossing|kids|soft|ki|l|H|F8F8E0,141414,141414,E0E0C8',
'Current|tech|modern|bg,el|s|F|E0E0E0,141414,141414,F8F8F8;F8E0C8,141414,1A1A1A,F8F8F8',
'Cutter|garden|editorial|ho,fd,ga,be|s|B|F8F8F8,141414,C880E0,C898E0;C8F850,141414,1A1A1A,F8F8E0;F8F8E0,141414,1C1C1C,F8F8F8;F8F8F8,141414,141414,F8F8E0',
'Dale|fashion|bold|cl|l|H|F8F8F8,141414,E06820,E06820;F8F8F8,141414,1C1C1C,E0E0E0',
'Delta|food|editorial|fd,ga,be|fs|F|F8F8F8,141414,58280F,F2F2F2;E0E0E0,141414,503820,F8F8F8;F8F8E0,141414,806850,E0E0E0;F8F8F8,141414,1A1A1A,F8E068;F8F8E0,141414,141414,F8E0E0',
'Dunegrass|men|lux|sh|s|A|E0E0E0,141414,203868,F8F8F8',
'Easel|food|bold|sp,fd,el|s|C|F8F8F8,141414,802038,F2F2F2;F8F8F8,141414,1C1C1C,F2F2F2',
'Eddy|jewel|modern|cl,je|sl|H|F8F8F8,141414,B7876D,E0E0E0;505068,F5F5F5,FDFDFD,222222',
'Embank|fashion|lux|cl,ho|s|A|F8F8F8,141414,937258,E0E0E0;F8F8F8,141414,141414,E0E0E0',
'Estuary|tech|modern|cl,ki,el|sl|H|E0E0E0,141414,685020,F8F8F8;F8F8F8,141414,1C1C1C,E0E0E0',
'Falcon|fashion|lux|cl|s|F|F8F8F8,141414,F82020,E0E0F8',
'Ferry|bags|modern|bg|s|A|F8F8F8,141414,506880,F2F2F2',
'Fieldstone|fashion|modern|cl|s|D|F8F8F8,141414,31241F,E0E0E0',
'Fjordline|beauty|modern|cl,we,ki|l|H|F8F8F8,141414,B05068,E0E0E0;C8B098,141414,141414,F8E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Flagstone|kids|soft|ki|s|A|F8F8F8,141414,123B91,E0F8F8',
'Fountain|food|bold|fd|fs|D|F8F8F8,141414,C32522,F2F2F2;C8E0C8,141414,1C1C1C,F8F8F8;F8F8F8,141414,141414,F8B008',
'Furrow|beauty|bold|be|s|F|F8F8F8,141414,EF3B0C,E0C8F8',
'Gable|home|modern|ho,fd|s|B|F8E0E0,141414,8068C8,E0C8E0;F8F8F8,141414,685038,E0E0E0',
'Galleon|tech|editorial|en|s|D|080808,F5F5F5,686838,222222',
'Garnetta|jewel|modern|cl,be,je|s|E|F8F8F8,141414,0898C8,0898B0;F8F8F8,141414,1A1A1A,E0E0E0',
'Gatehouse|fashion|bold|cl|s|A|F8F8F8,141414,3B2720,E0E0E0',
'Glacier|fashion|lux|cl|s|D|C85050,F5F5F5,F5F5F5,222222',
'Glen|food|bold|fd|s|F|F8F8F8,141414,472B21,E0E0E0',
'Granary|bags|lux|bg|s|A|F8F8F8,141414,35281F,989898',
'Grotto|food|bold|bg,fd,be|s|D|F8F8F8,141414,BF8F62,E0E0E0;E0E0E0,141414,685038,F8F8F8;F8F8F8,141414,1C1C1C,E0E0E0',
'Gully|fashion|lux|cl|sl|H|F8F8F8,141414,6B5122,F2F2F2;E0E0E0,141414,1C1C1C,F8F8F8',
'Hamlet|home|lux|ho|s|A|E0E0E0,141414,25211F,F2F2F2',
'Harbourline|food|modern|fd|s|D|F8E0E0,141414,985068,F8F8E0',
'Hayloft|tech|lux|se,en|s|E|080808,F5F5F5,FAF8F6,080820;F8F8F8,141414,1C1C1C,808080;C8E0E0,141414,1A1A1A,F8F8F8',
'Headland|home|soft|ho|l|H|F8F8F8,141414,81514E,F2F2F2',
'Heath|fashion|modern|cl,je|sl|C|F8F8F8,141414,A67E67,E0E0E0;F8F8F8,141414,1C1C1C,808080;F8F8E0,141414,1A1A1A,F8E0E0;F8F8F8,141414,141414,E0C8B0',
'Hillock|jewel|lux|au,ho,je|l|H|080808,F5F5F5,C83838,200808;685038,F5F5F5,E0B068,222222;F8F8F8,141414,1C1C1C,F2F2F2',
'Hollow|garden|lux|cl,ga,be|sl|A|C8B098,141414,141414,E0E0C8;F8F8F8,141414,141414,E0E0E0;F8F8F8,141414,1C1C1C,989898',
'Inlet|fashion|bold|cl|l|H|F8F8F8,141414,3E2D22,C8C8C8',
'Isle|home|modern|ho|l|H|F8F8F8,141414,533023,E0E0E0',
'Jetty|fashion|editorial|cl|s|A|202020,F5F5F5,ECE4E0,202008',
'Keel|kids|bold|we,to|sl|D|F8F8F8,141414,E05050,E0E0E0;E080F8,141414,1A1A1A,F86850',
'Lantana|beauty|bold|be|s|F|E0E0E0,141414,5068C8,E0E0F8',
'Ledge|sport|bold|sp|s|A|202020,F5F5F5,C8E008,222222',
'Lighthouse|food|modern|fd|s|D|F8F8F8,141414,B00820,E0E0E0',
'Lodge|beauty|bold|be|s|F|F8F8F8,141414,B28268,F8F8E0',
'Mantel|fashion|editorial|cl|s|A|F8F8F8,141414,241E2D,E0E0E0',
'Marina|books|editorial|ar|s|D|F8F8F8,141414,161B1A,E0E0E0',
'Meander|books|editorial|of|s|F|F8F8F8,141414,A88C72,E0E0E0',
'Mill|home|modern|ho|l|H|F8F8F8,141414,725339,E0E0E0',
'Moor|home|lux|ho|s|D|F8F8F8,141414,745439,E0E0E0',
'Mosaictile|tech|editorial|en|s|F|E0E0C8,141414,1C1C1C,F8F8E0',
'Narrows|beauty|soft|we,fd,to,be,pe|s|B|F8F8F8,141414,6B93A7,E0E0E0;F8F8F8,141414,B08080,B09898;F8F8F8,141414,B08080,C8B0B0;E0E0C8,141414,141414,F8F8E0',
'Orchardine|bags|soft|bg|f|D|E0E0E0,141414,985038,C8C8C8',
'Outpost|food|bold|se,bg,fd,je|s|E|080808,F5F5F5,2038E0,0808C8;F8F8F8,141414,3880C8,E0E0E0;F8F8F8,141414,8050B0,E0E0E0;F8F8F8,141414,1A1A1A,F8E0C8;F8F8F8,141414,1C1C1C,E0E0E0',
'Paddock|kids|soft|we,fd,to,be,pe|s|B|F8F8E0,141414,686808,B09898;F8F8F8,141414,506898,E0E0E0;F8F8E0,141414,1A1A1A,C8B0C8;E0E050,141414,1A1A1A,F8F8E0',
'Pasture|sport|lux|sp,cl,el|s|D|F8F8F8,141414,63523B,E0E0E0;F8F8F8,141414,1C1C1C,F2F2F2',
'Pavilion|tech|modern|cl,ho,sh,fd,el|s|E|F8F8F8,141414,205068,F2F2F2;F8F8F8,141414,203850,E0E0E0;F8F8F8,141414,685038,E0E0E0;F8F8F8,141414,503820,E0E0E0'];
var INDN={ar:'Art',au:'Auto',bg:'Bags',be:'Beauty',cl:'Clothing',el:'Electronics',en:'Entertainment',fd:'Food and drink',ga:'Garden',hw:'Hardware',ho:'Home',je:'Jewelry and accessories',ki:'Kids',of:'Office',pe:'Pets',se:'Services',sh:'Shoes',sp:'Sports',to:'Toys',we:'Wellness'};
var SZN={o:'One product',f:'Few (2–10)',s:'Some (11–100)',l:'Lots (100+)'};
var HEROS=['full','center','split','type','mosaic','card','block'],HDRS=['left','center','stack','dark','pill'],CARDS=['plain','border','tile','shadow','round'],BTNS=['square','outline','pill','soft'];
ROWS2.forEach(function(r,j){var a=r.split('|');if(a.length<7)return;var i=ROWS.length+j,m=MOOD[a[2]]||MOOD.modern,pk=null;
 for(var k=0;k<600&&!pk;k++){var hero=m.hero[(i+k)%m.hero.length],hdr=m.hdr[(i*3+k+Math.floor(k/4))%m.hdr.length],card=m.card[(i+Math.floor(k/2))%m.card.length],f=m.f[(i*7+Math.floor(k/3))%m.f.length],sig=hero+'/'+hdr+'/'+card+'/'+f;if(!USED[sig]){USED[sig]=1;pk={hero:hero,hdr:hdr,card:card,f:f}}}
 for(var k2=0;k2<4000&&!pk;k2++){var h2=HEROS[(i+k2)%7],d2=HDRS[(i*3+Math.floor(k2/7))%5],c2=CARDS[(i+Math.floor(k2/35))%5],f2=(i*7+Math.floor(k2/175))%FONTS.length,sg=h2+'/'+d2+'/'+c2+'/'+f2;if(!USED[sg]){USED[sg]=1;pk={hero:h2,hdr:d2,card:c2,f:f2}}}
 if(!pk)pk={hero:m.hero[0],hdr:m.hdr[0],card:m.card[0],f:m.f[0]};
 var P=a[6].split(';').map(function(x){return x.split(',').map(function(c){return '#'+c})}),sz=a[4].split('').map(function(c){return SZN[c]}).filter(Boolean),p0=P[0];
 LIB.push({id:'v-'+slugify(a[0]),name:a[0],demo:a[1],mood:a[2],bg:p0[0],tx:p0[1],ac:p0[2],s:p0[3],pals:P,kind:a[5]==='G'?'one':a[5]==='H'?'lots':'',isNew:true,batch:2,hero:pk.hero,hdr:pk.hdr,card:pk.card,fp:pk.f,btn:(m.btn.concat(BTNS))[i%(m.btn.length+2)],caps:m.caps&&(i%3!==1)?1:0,rad:{soft:14,modern:8,lux:0,bold:0,editorial:0}[a[2]],lay:a[5],i:i,
  size:sz[0]||'Some (11–100)',sizes:sz.length?sz:['Some (11–100)'],ind:a[3].split(',').map(function(c){return INDN[c]}).filter(Boolean)})});
X.V21_LIB=LIB;X.V21_DEFAULT='v-kestrel';
function libOf(id){return LIB.filter(function(x){return x.id===id})[0]}
function features(L){var f=['Mobile-friendly','Announcement bar','Collection tiles','Newsletter'],secs=LAYOUTS[L.lay];if(secs.indexOf('marquee')>=0)f.push('Scrolling text');if(secs.indexOf('look')>=0)f.push('Lookbook');if(secs.indexOf('promo')>=0||secs.indexOf('promo2')>=0)f.push('Image with text');if(secs.indexOf('grid2')>=0)f.push('Product carousel');if(secs.indexOf('feats')>=0)f.push('Trust badges');if(L.hero==='mosaic')f.push('Image mosaic');if(L.hdr!=='stack')f.push('Sticky header');if(L.kind==='one')f.push('Single-product focus');if(L.kind==='lots')f.push('Large catalogues');f.push('Right-to-left');return f.filter(function(x){return x!=='Collection tiles'||secs.join().indexOf('cats')>=0})}

/* ---------- section types (they work in the theme editor too) ---------- */
var BG=['bg','Background','c','','bg'],FG=['fg','Text color','c','','tx'],LK=['link','Button links to','s','catalog',['home','catalog','collection','product','contact']];
var SCH2={
 v_header:[['style','Layout','s','Logo left',['Logo left','Logo centred','Stacked','Dark bar','Floating']],['menu','Menu links (one per line)','a','Shop\nNew in\nCollections\nAbout\nContact'],['sticky','Stay at the top when scrolling','k',true],BG,FG],
 v_hero:[['style','Layout','s','Full image',['Full image','Centred','Split','Big type','Mosaic','Card','Colour block']],['img','Image','i',''],['img2','Second image','i',''],['img3','Third image','i',''],['eyb','Small text above heading','t','New collection'],['h','Heading','t','New season'],['sub','Text','t','Discover the latest arrivals.'],['btn','Button text','t','Shop now'],LK,['btn2','Second button','t',''],['ht','Height','r',640,[360,900]],['ov','Image darkness','r',28,[0,80]],BG,FG],
 v_cats:[['style','Style','s','Tiles',['Tiles','Overlay','Circles']],['h','Heading','t','Shop by category'],['n','Tiles','r',4,[2,6]]].concat([1,2,3,4,5,6].reduce(function(a,n){return a.concat([['c'+n+'t','Tile '+n+' title','t',''],['c'+n+'i','Tile '+n+' image','i','']])},[])).concat([BG,FG]),
 v_grid:[['h','Heading','t','New arrivals'],['col','Collection (blank = all products)','t',''],['n','Products to show','r',8,[2,20]],['cols','Columns','r',4,[2,6]],['style','Layout','s','Grid',['Grid','Carousel']],['ratio','Image shape','s','Portrait',['Portrait','Square']],['sort','Sort','s','Newest',['Newest','Price: low to high','Price: high to low','Name A-Z']],['all','Show "View all" link','k',true],BG,FG],
 v_promo:[['img','Image','i',''],['eyb','Small text','t',''],['h','Heading','t','Made to last'],['txt','Text','a','Tell customers what makes your products special.'],['btn','Button text','t','Discover'],LK,['side','Image side','s','Left',['Left','Right']],BG,FG],
 v_marquee:[['txt','Text','t','FREE DELIVERY • EASY RETURNS • SECURE CHECKOUT • CASH ON DELIVERY'],['sz','Text size','r',30,[14,90]],['spd','Speed (seconds)','r',28,[8,80]],BG,FG],
 v_feats:[['n','Columns','r',4,[2,4]],['c1t','Column 1 title','t','Fast delivery'],['c1x','Column 1 text','t','Dispatched within 24 hours.'],['c2t','Column 2 title','t','Easy returns'],['c2x','Column 2 text','t','Changed your mind? Send it back in 14 days.'],['c3t','Column 3 title','t','Secure checkout'],['c3x','Column 3 text','t','Cards, wallets and VendOm Pay Protection.'],['c4t','Column 4 title','t','Real support'],['c4x','Column 4 text','t','Talk to us on WhatsApp or email.'],BG,FG],
 v_look:[['h','Heading','t','The lookbook'],['n','Images','r',2,[2,3]],['img1','Image 1','i',''],['t1','Caption 1','t',''],['img2','Image 2','i',''],['t2','Caption 2','t',''],['img3','Image 3','i',''],['t3','Caption 3','t',''],BG,FG],
 v_story:[['eyb','Small text','t','Our story'],['txt','Text','a','We started with one idea: make good things, sell them honestly, and treat every customer like a friend.'],['btn','Button text','t','About us'],LK,BG,FG],
 v_news:[['h','Heading','t','Join our list'],['txt','Text','t','Be the first to hear about new arrivals and offers.'],BG,FG],
 v_footer:[['txt','About text','a','Thoughtfully made products, delivered with care.'],['menu','Shop links','a','Shop\nNew in\nCollections'],['menu2','Help links','a','Contact\nShipping\nReturns'],['news','Show newsletter','k',true],BG,FG]};
var LBL2={v_header:'Header (VendOm)',v_hero:'Hero banner',v_cats:'Collection tiles',v_grid:'Product grid',v_promo:'Image with text',v_marquee:'Scrolling text',v_feats:'Trust badges',v_look:'Lookbook',v_story:'Brand story',v_news:'Newsletter',v_footer:'Footer (VendOm)'};
try{Object.keys(SCH2).forEach(function(k){SCH[k]=SCH2[k];LBL[k]=LBL2[k];ICON[k]='▦'});if(typeof GRP!=='undefined'&&!GRP.some(function(g){return g[0]==='VendOm sections'}))GRP.unshift(['VendOm sections',['v_hero','v_cats','v_grid','v_promo','v_marquee','v_feats','v_look','v_story','v_news']])}catch(e){console.error('v21 schema',e)}

var SVG={search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',bag:'<path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',truck:'<path d="M2 6h11v10H2zM13 10h5l3 3v3h-8"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',ret:'<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4"/>',lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',chat:'<path d="M4 5h16v11H8l-4 4z"/>',arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>'};
function ic(k){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+SVG[k]+'</svg>'}
function V_(s,k){return v(s,k)}
function img(u,alt,cls){return u?'<img src="'+esc(u)+'" alt="'+esc(alt||'')+'" loading="lazy"'+(cls?' class="'+cls+'"':'')+'>':'<div class="vph'+(cls?' '+cls:'')+'"></div>'}
function btns(s,k1,k2){var b='';if(V_(s,k1||'btn'))b+='<a class="vbtn" data-pg="'+V_(s,'link')+'">'+esc(V_(s,k1||'btn'))+'</a>';if(k2!==false&&V_(s,'btn2'))b+='<a class="vbtn vbtn2" data-pg="catalog">'+esc(V_(s,'btn2'))+'</a>';return b?'<div class="vbtns">'+b+'</div>':''}
function menuOf(txt){try{return menu(txt)}catch(e){return []}}
function cardP(p,ratio){var im=p.imgs&&p.imgs[0],sale=p.cmp&&+p.cmp>+p.price;return '<div class="pc" data-pid="'+p.id+'"><div class="vpi'+(ratio==='Square'?' sq':'')+'">'+img(im,p.name)+(sale?'<em class="vsale">Sale</em>':'')+'<span class="atc" role="button" tabindex="0">Add to cart</span></div><div class="vpm"><b>'+esc(p.name)+'</b><span>'+money(p.price)+(sale?' <s>'+money(p.cmp)+'</s>':'')+'</span></div></div>'}
function sty(bg,fg){return bg||fg?' style="'+(bg?'background:'+bg+';':'')+(fg?'color:'+fg:'')+'"':''}
function head2(t,all){return '<div class="vsh"><h3>'+esc(t)+'</h3>'+(all?'<a data-pg="catalog">View all '+ic('arrow')+'</a>':'')+'</div>'}
RN.v_header=function(t,s){var st={'Logo left':'left','Logo centred':'center','Stacked':'stack','Dark bar':'dark','Floating':'pill'}[V_(s,'style')]||'left',L=menuOf(V_(s,'menu')),bg=V_(s,'bg'),fg=V_(s,'fg');
 var logo='<a class="vlogo" data-pg="home">'+esc(S.name||'Store')+'</a>',nav='<div class="vnav" role="navigation">'+L.map(function(x){return '<a data-pg="'+x.pg+'">'+esc(x.n)+'</a>'}).join('')+'</div>',icons='<div class="vic"><span aria-label="Search">'+ic('search')+'</span><span class="acct" data-act="acct" role="button" tabindex="0" aria-label="Account">'+ic('user')+'</span><span class="cartb" role="button" tabindex="0" aria-label="Cart">'+ic('bag')+'</span></div>';
 var inner=st==='center'?nav+logo+icons:st==='stack'?'<div class="vstk1"><span></span>'+logo+icons+'</div>'+nav:logo+nav+icons;
 return '<header class="vh vh-'+st+(V_(s,'sticky')?' vstick':'')+'" data-sid="'+s.id+'"'+(bg||fg?' style="'+(bg?'--hb:'+bg+';':'')+(fg?'--hf:'+fg:'')+'"':'')+'>'+inner+'</header>'};
RN.v_hero=function(t,s){var st={'Full image':'full','Centred':'center','Split':'split','Big type':'type','Mosaic':'mosaic','Card':'card','Colour block':'block'}[V_(s,'style')]||'full',i1=V_(s,'img'),i2=V_(s,'img2')||i1,i3=V_(s,'img3')||i2,o=(+V_(s,'ov')||0)/100,ht=+V_(s,'ht')||640;
 var txt=(V_(s,'eyb')?'<p class="veyb">'+esc(V_(s,'eyb'))+'</p>':'')+'<h2>'+esc(V_(s,'h'))+'</h2>'+(V_(s,'sub')?'<p class="vsub">'+esc(V_(s,'sub'))+'</p>':'')+btns(s);
 var bgi=function(u){return u?'background-image:url('+esc(u)+')':''};
 var body;
 if(st==='split')body='<div class="vx-txt">'+txt+'</div><div class="vx-img" style="'+bgi(i1)+'"></div>';
 else if(st==='type')body='<div class="vx-typeh">'+txt+'</div><div class="vx-strip"><div style="'+bgi(i1)+'"></div><div style="'+bgi(i2)+'"></div><div style="'+bgi(i3)+'"></div></div>';
 else if(st==='mosaic')body='<div class="vx-m1" style="'+bgi(i1)+'"><div class="vx-ov" style="--o:'+o+'"></div><div class="vx-txt">'+txt+'</div></div><div class="vx-m2" style="'+bgi(i2)+'"></div><div class="vx-m3" style="'+bgi(i3)+'"></div>';
 else if(st==='block')body='<div class="vx-txt">'+txt+'</div><div class="vx-img"><div style="'+bgi(i1)+'"></div></div>';
 else if(st==='card')body='<div class="vx-ov" style="--o:'+(o*.6)+'"></div><div class="vx-box">'+txt+'</div>';
 else body='<div class="vx-ov" style="--o:'+o+'"></div><div class="vx-txt">'+txt+'</div>';
 var full=st==='full'||st==='center'||st==='card';
 var hb=V_(s,'bg'),hf=V_(s,'fg');return '<section class="vx vx-'+st+'" data-sid="'+s.id+'" style="--ht:'+ht+'px;'+(full?bgi(i1):'')+(hb?'background-color:'+hb+';':'')+(hf?'--hxf:'+hf+';':'')+'">'+body+'</section>'};
RN.v_cats=function(t,s){var st=(V_(s,'style')||'Tiles').toLowerCase(),n=+V_(s,'n')||4,cols=(S.collections||[]),tiles=[];
 for(var i=1;i<=n;i++){var tt=V_(s,'c'+i+'t'),im=V_(s,'c'+i+'i'),c=cols[i-1];if(!tt&&c)tt=c.title;if(!im&&c&&c.pic)im=c.pic;if(tt||im)tiles.push([tt||'Collection',im])}
 if(!tiles.length)return '';
 return '<section class="vsec vcats vc-'+st+'" data-sid="'+s.id+'"'+sty(V_(s,'bg'),V_(s,'fg'))+'>'+head2(V_(s,'h'))+'<div class="vcg" style="--n:'+tiles.length+'">'+tiles.map(function(x){return '<a class="vct" data-pg="collection"><div class="vcti">'+img(x[1],x[0])+'</div><span>'+esc(x[0])+'</span></a>'}).join('')+'</div></section>'};
RN.v_grid=function(t,s){var col=V_(s,'col'),L=acts(V_(s,'sort')==='Newest'?'':V_(s,'sort')).filter(function(p){return !col||(p.cols||[]).indexOf(col)>=0}).slice(0,+V_(s,'n')||8),car=V_(s,'style')==='Carousel',bg=V_(s,'bg'),fg=V_(s,'fg');
 return '<section class="vsec vgrid" data-sid="'+s.id+'"'+sty(bg,fg)+'>'+head2(V_(s,'h'),V_(s,'all'))+(L.length?'<div class="vg'+(car?' vcar':'')+'" style="--c:'+(+V_(s,'cols')||4)+'">'+L.map(function(p){return cardP(p,V_(s,'ratio'))}).join('')+'</div>':'<p class="vempty">Add products to show them here.</p>')+'</section>'};
RN.v_promo=function(t,s){var r=V_(s,'side')==='Right',bg=V_(s,'bg'),fg=V_(s,'fg');return '<section class="vpromo'+(r?' vr':'')+'" data-sid="'+s.id+'"'+(bg||fg?' style="'+(bg?'--pb:'+bg+';':'')+(fg?'--pf:'+fg:'')+'"':'')+'><div class="vpr-img" style="'+(V_(s,'img')?'background-image:url('+esc(V_(s,'img'))+')':'')+'"></div><div class="vpr-txt">'+(V_(s,'eyb')?'<p class="veyb">'+esc(V_(s,'eyb'))+'</p>':'')+'<h3>'+esc(V_(s,'h'))+'</h3><p>'+esc(V_(s,'txt'))+'</p>'+btns(s,'btn',false)+'</div></section>'};
RN.v_marquee=function(t,s){var bg=V_(s,'bg'),fg=V_(s,'fg'),tx=esc(V_(s,'txt'))+'&nbsp;&nbsp;&nbsp;';return '<div class="vmq" data-sid="'+s.id+'" style="font-size:'+V_(s,'sz')+'px;'+(bg?'--mb:'+bg+';':'')+(fg?'--mf:'+fg:'')+'"><div style="animation-duration:'+V_(s,'spd')+'s">'+tx.repeat(6)+'</div></div>'};
RN.v_feats=function(t,s){var n=+V_(s,'n')||4,I=['truck','ret','lock','chat'],o='';for(var i=1;i<=n;i++)o+='<div class="vft">'+ic(I[i-1])+'<b>'+esc(V_(s,'c'+i+'t'))+'</b><span>'+esc(V_(s,'c'+i+'x'))+'</span></div>';var bg=V_(s,'bg'),fg=V_(s,'fg');return '<section class="vfeats" data-sid="'+s.id+'" style="--n:'+n+';'+(bg?'background:'+bg+';':'')+(fg?'color:'+fg:'')+'">'+o+'</section>'};
RN.v_look=function(t,s){var n=+V_(s,'n')||2,o='';for(var i=1;i<=n;i++){var u=V_(s,'img'+i);o+='<a class="vlk" data-pg="collection" style="'+(u?'background-image:url('+esc(u)+')':'')+'"><span>'+esc(V_(s,'t'+i)||'')+'</span></a>'}return '<section class="vsec vlook" data-sid="'+s.id+'"'+sty(V_(s,'bg'),V_(s,'fg'))+'>'+head2(V_(s,'h'))+'<div class="vlg" style="--n:'+n+'">'+o+'</div></section>'};
RN.v_story=function(t,s){var bg=V_(s,'bg'),fg=V_(s,'fg');return '<section class="vstory" data-sid="'+s.id+'" style="'+(bg?'background:'+bg+';':'')+(fg?'color:'+fg:'')+'">'+(V_(s,'eyb')?'<p class="veyb">'+esc(V_(s,'eyb'))+'</p>':'')+'<p class="vst">'+esc(V_(s,'txt'))+'</p>'+btns(s,'btn',false)+'</section>'};
RN.v_news=function(t,s){var bg=V_(s,'bg'),fg=V_(s,'fg');return '<section class="vnews" data-sid="'+s.id+'" style="'+(bg?'background:'+bg+';':'')+(fg?'color:'+fg:'')+'"><h3>'+esc(V_(s,'h'))+'</h3><p>'+esc(V_(s,'txt'))+'</p><div class="vnf"><input id="nle" type="email" placeholder="Email address" aria-label="Email"><button class="vbtn" type="button" data-act="news">Subscribe</button></div></section>'};
RN.v_footer=function(t,s){var bg=V_(s,'bg'),fg=V_(s,'fg'),col=function(ttl,txt){return '<div><b>'+ttl+'</b>'+menuOf(txt).map(function(x){return '<a data-pg="'+x.pg+'">'+esc(x.n)+'</a>'}).join('')+'</div>'};
 return '<footer class="vfoot" data-sid="'+s.id+'" style="'+(bg?'--fb2:'+bg+';':'')+(fg?'--ff:'+fg:'')+'"><div class="vfg"><div><span class="vlogo">'+esc(S.name||'Store')+'</span><p>'+esc(V_(s,'txt'))+'</p></div>'+col('Shop',V_(s,'menu'))+col('Help',V_(s,'menu2'))+(V_(s,'news')?'<div><b>Stay in touch</b><div class="vnf sm"><input type="email" placeholder="Email" aria-label="Email"><button class="vbtn" type="button" data-act="news">Join</button></div></div>':'')+'</div><div class="vfb"><span>© '+new Date().getFullYear()+' '+esc(S.name||'Store')+'</span><span class="vpay"><i>Visa</i><i>Mastercard</i><i>VendOm Pay</i><i>COD</i></span></div></footer>'};

var _an=RN.announce;RN.announce=function(t,s){var o=_an.apply(this,arguments);if(!t||!t.v21)return o;var bg=v(s,'bg')||t.ac,fg=v(s,'fg')||onAc(t.ac||'#111111');return o.replace('class="an"','class="an van" data-v="1"').replace('style="','style="--anb:'+bg+';--anf:'+fg+';')};
/* ---------- build a theme object from the library ---------- */
function mk(type,o){return{id:uid(),type:type,hide:false,s:Object.assign({},o||{})}}
function build(L,palette){var d=DEMO[L.demo],k=L.i,H=d.h,hp=function(j){return hi(H[(k+j)%H.length])},cp=d.copy[k%d.copy.length],pal=palette||[L.bg,L.tx,L.ac,L.s];
 var t={id:L.id,name:L.name,v21:1,lib:L.id,free:true,tag:L.mood,desc:d.copy[0][1],bg:pal[0],tx:pal[1],ac:pal[2],s2:pal[3],font:'s',lay:'c',rad:L.rad,fh:FONTS[L.fp][0],fb:FONTS[L.fp][1],btn:L.btn,card:L.card,caps:L.caps?'Yes':'No',c:{},ts:{},so:{}};
 initT(t);
 var ann=['Free delivery on orders over Rs 5,000','Cash on delivery available nationwide','New arrivals every week','Secure checkout with VendOm Pay'][k%4];
 t.hdr=[mk('announce',{msg:ann,sz:13,bg:k%2?pal[1]:pal[2],fg:k%2?pal[0]:onAc(pal[2])}),mk('v_header',{style:HDR_L[L.hdr],sticky:L.hdr!=='stack'})];
 t.ftr=[mk('v_footer',{})];
 var secs=LAYOUTS[L.lay].map(function(x){switch(x){
  case 'hero':return mk('v_hero',{style:HERO_L[L.hero],img:hp(0),img2:hp(1),img3:hp(2),eyb:['New collection','Just landed','Spring / Summer','Limited edition','Made by hand'][k%5],h:cp[0],sub:cp[1],btn:'Shop now',btn2:k%3===0?'Explore':'',ht:[620,680,560,720][k%4],ov:L.hero==='center'?38:28});
  case 'marquee':return mk('v_marquee',{sz:[26,34,44][k%3]});
  case 'cats':case 'cats6':var o={style:['Tiles','Overlay','Circles'][(k+(x==='cats6'?2:0))%3],n:x==='cats6'?Math.min(6,d.c.length+2):d.c.length};d.c.forEach(function(c,j){o['c'+(j+1)+'t']=c[0];o['c'+(j+1)+'i']=pi(c[1])});if(x==='cats6'){o.c5t='Sale';o.c5i=pi(d.p[0][0]);o.c6t='Gifts';o.c6i=pi(d.p[1][0])}return mk('v_cats',o);
  case 'grid':return mk('v_grid',{h:['New arrivals','Best sellers','Just in','Shop the edit'][k%4],n:L.mood==='lux'?4:8,cols:L.mood==='lux'?4:4,ratio:L.demo==='tech'||L.demo==='food'?'Square':'Portrait'});
  case 'grid2':return mk('v_grid',{h:'Customer favourites',n:8,cols:4,style:'Carousel',sort:'Price: high to low',ratio:'Square'});
  case 'grid3':return mk('v_grid',{h:'Complete the set',n:3,cols:3,ratio:'Square'});
  case 'grid5':return mk('v_grid',{h:'Shop everything',n:10,cols:5,ratio:'Square'});
  case 'promo':case 'promo2':return mk('v_promo',{img:hp(3),eyb:'Why us',h:['Made to last','Crafted with care','Good things take time'][k%3],txt:'Tell customers what makes your products special: the materials, the makers and the care that goes into every order.',side:x==='promo2'?'Right':'Left',bg:L.s});
  case 'feats':return mk('v_feats',{});
  case 'look':return mk('v_look',{n:k%2?3:2,img1:hp(1),t1:'Shop the look',img2:hp(2),t2:'New in',img3:hp(4),t3:'Best sellers'});
  case 'story':return mk('v_story',{});
  case 'news':return mk('v_news',{bg:L.s});}}).filter(Boolean);
 t.pg.home=secs;return t}
X.V21_build=function(id){var L=libOf(id);return L?build(L):null};

/* ---------- root styling hook: theme fonts, button and card styles ---------- */
var FONT_URL='https://fonts.googleapis.com/css2?'+['Inter:wght@400;500;600;700','Playfair+Display:wght@500;700','Cormorant+Garamond:wght@500;600;700','DM+Serif+Display','DM+Sans:wght@400;500;700','Space+Grotesk:wght@500;700','Archivo+Black','Archivo:wght@400;600','Bebas+Neue','Work+Sans:wght@400;500;600','Fraunces:wght@500;700','Outfit:wght@400;500;600;700','Syne:wght@600;800','Manrope:wght@400;600;700','Unbounded:wght@500;700','Instrument+Serif','Sora:wght@400;600;700','Bricolage+Grotesque:wght@500;700','Figtree:wght@400;600','Libre+Baskerville:wght@400;700','Anton'].map(function(f){return 'family='+f}).join('&')+'&display=swap';
function fonts(){if(document.getElementById('v21fonts'))return;var l=document.createElement('link');l.id='v21fonts';l.rel='stylesheet';l.href=FONT_URL;document.head.appendChild(l)}
function cls(t){return 'v21 b-'+(t.btn||'soft')+' c-'+(t.card||'plain')+(t.caps==='Yes'?' caps':'')}
function vars(t){return '--fh:\''+(t.fh||'Inter')+'\';--fb:\''+(t.fb||'Inter')+'\';--s2:'+(t.s2||'#f4f4f4')+';--ab:'+onAc(t.ac||'#111111')+';'}
X.V21R=function(t){if(!t||!t.v21)return null;fonts();return{cls:cls(t),vars:vars(t)}};
function deco(t,o){if(!t||!t.v21||typeof o!=='string')return o;fonts();return o.replace('<div class="sf','<div data-v21="'+esc(t.lib||t.id)+'" class="'+cls(t)+' sf').replace('style="--b:','style="'+vars(t)+'--b:')}
var _sf=sf;sf=function(t){return deco(t,_sf.apply(this,arguments))};

/* ---------- preview with demo products (store data is restored right after) ---------- */
function withDemo(L,fn){var keep={p:S.products,n:S.name,c:S.collections};var d=DEMO[L.demo];
 S.products=d.p.map(function(x,j){return{id:900000+j,name:x[1],price:x[2],cmp:x[3]||0,imgs:[pi(x[0])],status:'Active',vars:[],opts:[],stock:20,handle:'demo-'+j,tags:[],cols:[]}});
 if(L.kind==='lots')S.products=S.products.concat(S.products.map(function(p,j){return Object.assign({},p,{id:900100+j,name:p.name+' II'})}));
 S.name=L.name;S.collections=[];try{return fn()}finally{S.products=keep.p;S.name=keep.n;S.collections=keep.c}}
var CACHE={};
function previewHtml(L,pal){var key=L.id+(pal?pal.join(''):'');if(CACHE[key])return CACHE[key];var t=build(L,pal);return CACHE[key]=withDemo(L,function(){return sf(t,'home')})}
X.V21_preview=function(id){var L=libOf(id);return L?previewHtml(L):''};

/* ---------- remove the old themes; install the default new one ---------- */
var OLD=/^(s-|dawn|ember|tide|orchard|noir|bloom|slate|sunset|mint|ink|aurora|sand)/;
function mig(){if(typeof S==='undefined'||!S||!Array.isArray(S.themes))return;var n0=S.themes.length;
 S.themes=S.themes.filter(function(t){return t.v21||(!t.free&&!OLD.test(String(t.id)))});
 if(!S.themes.some(function(t){return t.v21})){S.themes.unshift(build(libOf(X.V21_DEFAULT)))}
 if(!S.themes.some(function(t){return t.id===S.live}))S.live=(S.themes.filter(function(t){return t.v21})[0]||S.themes[0]).id;
 if(S.themes.length!==n0)try{save()}catch(e){}}
X.V21_mig=mig;try{mig()}catch(e){console.error('v21 mig',e)}
var _fresh=fresh;fresh=function(){var r=_fresh.apply(this,arguments);try{mig()}catch(e){}return r};

/* ---------- editor: theme-wide style settings ---------- */
try{var _tp=themePanel;themePanel=function(){var o=_tp.apply(this,arguments),t=E&&E.t;if(!t||!t.v21)return o;var a=' data-tk=';
 var sel=function(k,label,opts){return '<label>'+label+'<select'+a+'"'+k+'">'+opts.map(function(x){return '<option'+(String(t[k])===x?' selected':'')+'>'+x+'</option>'}).join('')+'</select></label>'};
 var fam=FONTS.map(function(f){return f[0]}).concat(['Manrope','DM Sans','Work Sans','Archivo','Figtree']).filter(function(x,i,arr){return arr.indexOf(x)===i});
 return o+'<div class="erb v21ed"><h4 style="margin:10px 0 4px">Theme style</h4>'+sel('fh','Heading font',fam)+sel('fb','Body font',fam)+sel('btn','Buttons',['soft','pill','square','outline'])+sel('card','Product cards',['plain','border','shadow','tile','round'])+sel('caps','Uppercase headings',['Yes','No'])+'<label>Panel colour<input type="color"'+a+'"s2" value="'+(t.s2||'#f4f4f4')+'"></label></div>'}}catch(e){}

/* ---------- navigation ---------- */
try{var os=(X.NAV_CONFIG||[]).filter(function(n){return n.id==='themes'})[0];if(os){os.sub=os.sub||[];if(!os.sub.some(function(s){return s.id==='theme-store'}))os.sub.splice(1,0,{id:'theme-store',label:'Theme store'})}}catch(e){}

/* ---------- Online Store › Themes ---------- */
function thumb(html,w){return '<div class="ts-frame"'+(w?' style="--w:'+w+'"':'')+'><div class="ts-in">'+html+'</div></div>'}
function ago(t){return t.added?new Date(t.added).toLocaleDateString():'Included'}
V.themes=function(){mig();var lv=live(),others=S.themes.filter(function(t){return t.id!==lv.id});
 var pop=LIB.filter(function(L){return !S.themes.some(function(t){return t.lib===L.id})}).slice(0,3);
 return '<div class="v21p"><div class="xh"><h1>Themes</h1><div style="display:flex;gap:8px"><button class="btn" data-tp="'+lv.id+'">View your store</button><button class="btn pri" data-x="go:theme-store">Visit Theme Store</button></div></div>'
  +'<div class="v21cur"><div class="v21cur-p">'+thumb(sf(lv,'home'))+'</div><div class="v21cur-i"><span class="v21live">Current theme</span><h2>'+esc(lv.name)+'</h2><p class="mu">'+(lv.v21?'VendOm theme · '+esc(lv.tag||''):'Custom theme')+'</p><div class="v21acts"><button class="btn pri" data-te="'+lv.id+'">Customize</button><button class="btn" data-tp="'+lv.id+'">Preview</button><button class="btn" data-x="v21dup:'+lv.id+'">Duplicate</button></div></div></div>'
  +'<div class="v21box"><div class="v21box-h"><h3>Theme library</h3><span class="mu">'+others.length+' of 20 themes</span></div>'+(others.length?others.map(function(t){return '<div class="v21row"><div class="v21row-p">'+thumb(sf(t,'home'))+'</div><div class="v21row-i"><b>'+esc(t.name)+'</b><span class="mu">Added '+ago(t)+'</span></div><div class="v21row-a"><button class="btn" data-te="'+t.id+'">Customize</button><button class="btn" data-tl="'+t.id+'">Publish</button><button class="btn" data-tx="'+t.id+'" aria-label="Remove '+esc(t.name)+'">Remove</button></div></div>'}).join(''):'<p class="mu" style="padding:16px 18px;margin:0">Themes you try from the Theme Store appear here.</p>')+'</div>'
  +'<div class="v21box"><div class="v21box-h"><h3>Popular free themes</h3><a class="lnk" data-x="go:theme-store">See all '+LIB.length+' themes</a></div><div class="ts-grid sm">'+pop.map(tcard).join('')+'</div></div></div>'};
A.v21dup=function(id){var t=S.themes.filter(function(x){return x.id===id})[0];if(!t)return;if(S.themes.length>=20){toast('Your library is full (20 themes). Remove one first.');return}var c=JSON.parse(JSON.stringify(t));c.id='t'+Date.now();c.name='Copy of '+t.name;c.added=Date.now();S.themes.push(c);save();toast('Theme duplicated');route()};

/* ---------- Theme Store ---------- */
var TS={pg:1,sort:'rel',f:{}};
function priceOf(){return 'Free'}
function tcard(L){return '<div class="ts-card" role="link" tabindex="0" aria-label="'+esc(L.name)+' theme" data-x="v21open:'+L.id+'" data-tsid="'+L.id+'"><div class="ts-p">'+thumb(previewHtml(L))+'</div><div class="ts-m"><b>'+esc(L.name)+'</b><span>Free'+(L.isNew?' <i class="ts-new">New</i>':'')+'</span></div></div>'}
var FACETS=[['price','Price',function(){return ['Free']},function(L){return ['Free']}],['ind','Industry',function(){var a=[];LIB.forEach(function(L){L.ind.forEach(function(x){if(a.indexOf(x)<0)a.push(x)})});return a.sort()},function(L){return L.ind}],
 ['size','Catalog size',function(){return ['One product','Few (2–10)','Some (11–100)','Lots (100+)']},function(L){return L.sizes||[L.size]}],
 ['style','Style',function(){return ['Bold','Editorial','Luxury','Modern','Soft']},function(L){return [{bold:'Bold',editorial:'Editorial',lux:'Luxury',modern:'Modern',soft:'Soft'}[L.mood]]}],
 ['feat','Features',function(){var a=[];LIB.forEach(function(L){features(L).forEach(function(x){if(a.indexOf(x)<0)a.push(x)})});return a.sort()},function(L){return features(L)}]];
function matches(L,skip){return FACETS.every(function(F){if(F[0]===skip)return true;var sel=TS.f[F[0]];if(!sel||!sel.length)return true;var v=F[3](L);return F[0]==='feat'?sel.every(function(x){return v.indexOf(x)>=0}):sel.some(function(x){return v.indexOf(x)>=0})})}
function results(){var R=LIB.filter(function(L){return matches(L)});if(TS.sort==='new')R=R.slice().sort(function(a,b){return (b.isNew?1:0)-(a.isNew?1:0)||a.i-b.i});if(TS.sort==='az')R=R.slice().sort(function(a,b){return a.name.localeCompare(b.name)});return R}
V['theme-store']=function(){var R=results(),per=24,pages=Math.max(1,Math.ceil(R.length/per));if(TS.pg>pages)TS.pg=pages;var from=(TS.pg-1)*per,page=R.slice(from,from+per);
 var side=FACETS.map(function(F){var sel=TS.f[F[0]]||[];return '<details class="ts-fac" open><summary>'+F[1]+'</summary>'+F[2]().map(function(val){var n=LIB.filter(function(L){return matches(L,F[0])&&F[3](L).indexOf(val)>=0}).length;return '<label class="ts-opt"><input type="checkbox" data-tsf="'+F[0]+'|'+esc(val)+'"'+(sel.indexOf(val)>=0?' checked':'')+'><span>'+esc(val)+'</span><em>'+n+'</em></label>'}).join('')+'</details>'}).join('');
 var pag='';if(pages>1){pag='<nav class="ts-pag" aria-label="Pages"><button class="ts-pb" data-x="v21pg:'+(TS.pg-1)+'"'+(TS.pg<=1?' disabled':'')+' aria-label="Previous page">‹</button>';for(var i=1;i<=pages;i++)pag+='<button class="ts-pb'+(i===TS.pg?' on':'')+'" data-x="v21pg:'+i+'">'+i+'</button>';pag+='<button class="ts-pb" data-x="v21pg:'+(TS.pg+1)+'"'+(TS.pg>=pages?' disabled':'')+' aria-label="Next page">›</button></nav>'}
 var any=Object.keys(TS.f).some(function(k){return TS.f[k].length});
 return '<div class="ts"><div class="ts-top"><a class="ts-back" data-x="go:themes">← Online Store</a><span class="ts-brand">VendOm Theme Store</span></div><div class="ts-hd"><h1>Browse all themes</h1></div><div class="ts-body"><div class="ts-side">'+(any?'<button class="lnk" data-x="v21clear" style="margin-bottom:8px">Clear all filters</button>':'')+side+'</div><div class="ts-main"><div class="ts-bar"><span id="ts-count">'+(R.length?(from+1)+'–'+(from+page.length)+' of '+R.length+' themes':'0 themes')+'</span><label class="ts-sort">Sort<select id="ts-sort"><option value="rel"'+(TS.sort==='rel'?' selected':'')+'>Relevance</option><option value="new"'+(TS.sort==='new'?' selected':'')+'>Newest</option><option value="az"'+(TS.sort==='az'?' selected':'')+'>Name A–Z</option></select></label></div>'
  +(page.length?'<div class="ts-grid">'+page.map(tcard).join('')+'</div>':'<div class="ts-none"><b>No themes match these filters.</b><button class="btn" data-x="v21clear">Clear filters</button></div>')+pag+'</div></div></div>'};
A.v21pg=function(n){TS.pg=Math.max(1,+n);route();scrollTo(0,0)};
A.v21clear=function(){TS.f={};TS.pg=1;route()};
document.addEventListener('change',function(e){var t=e.target;if(t&&t.dataset&&t.dataset.tsf){var p=t.dataset.tsf.split('|'),k=p[0],val=p.slice(1).join('|'),a=TS.f[k]=TS.f[k]||[];var i=a.indexOf(val);if(t.checked&&i<0)a.push(val);if(!t.checked&&i>=0)a.splice(i,1);TS.pg=1;route()}if(t&&t.id==='ts-sort'){TS.sort=t.value;TS.pg=1;route()}});

/* ---------- theme detail ---------- */
var TV={id:null,dev:'desktop',pal:0};
function pals(L){if(L.pals&&L.pals.length>1)return L.pals.slice(0,6);var dark=lum(L.bg)<.2;return [[L.bg,L.tx,L.ac,L.s],dark?['#FFFFFF','#141414',L.ac,'#F3F3F3']:['#141414','#F3F3F3',L.ac,'#222222'],[L.s,L.tx,L.tx===L.ac?L.bg:L.tx,L.bg]]}
A.v21open=function(id){TV.id=id;TV.dev='desktop';TV.pal=0;location.hash='theme-view'};
V['theme-view']=function(){var L=libOf(TV.id)||LIB[0],P=pals(L),pal=P[TV.pal]||P[0],inst=S.themes.filter(function(t){return t.lib===L.id})[0],isLive=inst&&inst.id===S.live;
 var html=previewHtml(L,TV.pal?pal:null);
 return '<div class="tv"><div class="ts-top"><a class="ts-back" data-x="go:theme-store">← All themes</a><span class="ts-brand">VendOm Theme Store</span></div><div class="tv-body"><div class="tv-info"><h1 id="tv-name">'+esc(L.name)+'</h1><p class="tv-price">Free</p><p class="mu">'+esc(DEMO[L.demo].copy[0][1])+' A '+({bold:'bold',editorial:'editorial',lux:'luxury',modern:'modern',soft:'soft'}[L.mood])+' theme for '+esc((function(a){a=a.slice(0,3).map(function(x){return x.toLowerCase()});return a.length>1?a.slice(0,-1).join(', ')+' and '+a[a.length-1]:a[0]})(L.ind))+' stores.</p>'
  +'<div class="tv-acts">'+(isLive?'<button class="btn" disabled>Current theme</button>':'<button class="btn pri" id="tv-try" data-x="v21try:'+L.id+'">'+(inst?'In your library':'Try theme')+'</button><button class="btn" id="tv-pub" data-x="v21pub:'+L.id+'">Publish</button>')+'</div>'
  +'<h4>Styles <span class="mu" style="font-weight:400">('+P.length+')</span></h4><div class="tv-pals">'+P.map(function(p,i){return '<button class="tv-pal'+(i===TV.pal?' on':'')+'" data-x="v21pal:'+i+'" aria-label="Style '+(i+1)+'" style="background:linear-gradient(135deg,'+p[0]+' 0 50%,'+p[2]+' 50% 100%);outline-color:'+p[1]+'"></button>'}).join('')+'</div>'
  +'<h4>Details</h4><ul class="tv-det"><li><b>Industry</b>'+esc(L.ind.join(', '))+'</li><li><b>Catalog size</b>'+esc((L.sizes||[L.size]).join(', '))+'</li><li><b>Fonts</b>'+esc(FONTS[L.fp][0]+' / '+FONTS[L.fp][1])+'</li><li><b>Hero</b>'+esc(HERO_L[L.hero])+'</li><li><b>Header</b>'+esc(HDR_L[L.hdr])+'</li></ul>'
  +'<h4>Features</h4><ul class="tv-feat">'+features(L).map(function(f){return '<li>'+esc(f)+'</li>'}).join('')+'</ul><p class="xk">Demo photos are examples. Your own products appear when you publish.</p></div>'
  +'<div class="tv-prev"><div class="tv-dev"><button class="'+(TV.dev==='desktop'?'on':'')+'" data-x="v21dev:desktop">Desktop</button><button class="'+(TV.dev==='mobile'?'on':'')+'" data-x="v21dev:mobile">Mobile</button></div>'
  +(TV.dev==='mobile'?'<div class="tv-phone"><div class="tv-phone-in">'+html+'</div></div>':'<div class="tv-desk">'+thumb(html)+'</div>')+'</div></div></div>'};
A.v21dev=function(d){TV.dev=d;route()};A.v21pal=function(i){TV.pal=+i;route()};
function install(id){var L=libOf(id);if(!L)return null;var ex=S.themes.filter(function(t){return t.lib===id})[0];if(ex)return ex;if(S.themes.length>=20){toast('Your library is full (20 themes). Remove one first.');return null}var t=build(L,TV.id===id&&TV.pal?pals(L)[TV.pal]:null);t.added=Date.now();if(S.themes.some(function(x){return x.id===t.id}))t.id=t.id+'-'+Date.now();S.themes.push(t);save();return t}
A.v21try=function(id){var t=install(id);if(t){toast(t.name+' added to your theme library');route()}};
A.v21pub=function(id){var t=install(id);if(!t)return;S.live=t.id;save();toast(t.name+' is now your live theme');location.hash='themes'};

/* ---------- size the scaled previews ---------- */
function fit(){qa('.ts-frame').forEach(function(f){var w=f.clientWidth;if(w)f.querySelector('.ts-in').style.zoom=(w/1280).toFixed(4)})}
X.onRoute(function(r){if(r==='themes'){var m=q('#m13live'),x=q('.v21p .xh');if(m&&x){x.parentNode.insertBefore(m,x.nextSibling);m.style.margin='0 0 18px'}}if(r==='themes'||r==='theme-store'||r==='theme-view'){fonts();fit();setTimeout(fit,60)}});
addEventListener('resize',function(){if(/^#(themes|theme-store|theme-view)$/.test(location.hash))fit()});

/* ---------- the live customer store inside a VendOm theme (search, currency, account and cart work) ---------- */
X.V21SHELL=function(t,body,c){fonts();var hs=(t.hdr||[]).filter(function(s){return s.type==='v_header'})[0]||{s:{}},fs=(t.ftr||[]).filter(function(s){return s.type==='v_footer'})[0],an=(t.hdr||[]).filter(function(s){return s.type==='announce'&&!s.hide})[0];
 var st={'Logo left':'left','Logo centred':'center','Stacked':'stack','Dark bar':'dark','Floating':'pill'}[hs.s.style]||'left';
 var logo='<a class="vlogo" data-sf="home">'+esc(S.name||'Store')+'</a>',nav='<div class="vnav" role="navigation">'+c.menu.map(function(l){return '<a data-sf="'+esc(l.to)+'">'+esc(l.n)+'</a>'}).join('')+'</div>';
 var icons='<div class="vic"><form id="xsfs" class="vsrch" role="search">'+ic('search')+'<input id="xsfq" placeholder="Search" aria-label="Search" value="'+esc(c.q)+'"></form><select id="xsfcur" aria-label="Currency" class="vcur">'+c.curs.map(function(x){return '<option'+(x===c.cur?' selected':'')+'>'+x+'</option>'}).join('')+'</select><a data-sf="account" aria-label="'+(c.user?'Account':'Log in')+'">'+ic('user')+'</a><a data-sf="cart" class="vcart" aria-label="Cart">'+ic('bag')+(c.cc?'<i>'+c.cc+'</i>':'')+'</a></div>';
 var inner=st==='center'?nav+logo+icons:st==='stack'?'<div class="vstk1"><span></span>'+logo+icons+'</div>'+nav:logo+nav+icons;
 var hb=hs.s.bg,hf=hs.s.fg;
 var annTxt=c.ann||(an&&an.s.msg)||'';
 var foot='';if(fs&&!fs.hide){var col=function(ttl,txt){return '<div><b>'+ttl+'</b>'+menuOf(txt).map(function(x){return '<a data-sf="'+(x.pg==='collection'?'catalog':x.pg)+'">'+esc(x.n)+'</a>'}).join('')+'</div>'};
  foot='<footer class="vfoot"><div class="vfg"><div><span class="vlogo">'+esc(S.name||'Store')+'</span><p>'+esc(v(fs,'txt'))+'</p></div>'+col('Shop',v(fs,'menu'))+'<div><b>Help</b>'+c.pages.map(function(p){return '<a data-sf="page:'+esc(p.h)+'">'+esc(p.t)+'</a>'}).join('')+'<a data-sf="blog">Blog</a><a data-sf="contact">Contact</a></div><div><b>Secure shopping</b><p>Protected by VendOm Pay.</p></div></div><div class="vfb"><span>© '+new Date().getFullYear()+' '+esc(S.name||'Store')+'</span><span class="vpay"><i>Visa</i><i>Mastercard</i><i>VendOm Pay</i><i>COD</i></span></div></footer>'}
 return '<div data-v21="'+esc(t.lib||t.id)+'" class="'+cls(t)+' sf vlive" style="'+vars(t)+'--b:'+t.bg+';--t:'+t.tx+';--a:'+t.ac+';--r:'+(t.rad||0)+'px;min-height:100%">'+c.bar+(annTxt?'<div class="an van" style="--anb:'+(an&&an.s.bg||t.ac)+';--anf:'+(an&&an.s.fg||onAc(t.ac))+';text-align:center;font-size:13px">'+annTxt+'</div>':'')
  +'<header class="vh vh-'+st+(hs.s.sticky!==false?' vstick':'')+'"'+(hb||hf?' style="'+(hb?'--hb:'+hb+';':'')+(hf?'--hf:'+hf:'')+'"':'')+'>'+inner+'</header><div class="vmain'+(c.home?' home':'')+'" role="main">'+body+'</div>'+foot+'</div>'};

/* ---------- styles ---------- */
var css=document.createElement('style');css.id='v21css';css.textContent=[
/* storefront */
'.v21.sf,.v21.vlive{background:var(--b)!important;color:var(--t)!important}.v21 .vh{background:var(--hb,var(--b))!important;color:var(--hf,var(--t))!important}.v21 .vh-dark{background:var(--hb,var(--t))!important;color:var(--hf,var(--b))!important}',
'.v21{container-type:inline-size;font-family:var(--fb),system-ui,sans-serif!important;background:var(--b);color:var(--t);line-height:1.5;-webkit-font-smoothing:antialiased}',
'.v21 h1,.v21 h2,.v21 h3{font-family:var(--fh),Georgia,serif;font-weight:700;letter-spacing:-.01em}.v21.caps h2,.v21.caps h3,.v21.caps .vlogo{text-transform:uppercase;letter-spacing:.04em}',
'.v21 a{color:inherit;text-decoration:none;cursor:pointer}.v21 img{display:block;max-width:100%}',
'.v21 .an.van{background:var(--anb)!important;color:var(--anf)!important}.v21 .an{padding:9px 16px!important;letter-spacing:.02em}.v21 .vnav{display:flex!important;flex-direction:row}.v21 .vnav a{display:inline-block!important;background:none!important;padding:0!important;color:inherit!important;box-shadow:none!important;width:auto!important}',
'.v21 .vbtn,.v21 .sb{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 28px;background:var(--a);color:var(--ab)!important;font-weight:600;font-size:15px;border:1.5px solid var(--a);border-radius:10px;cursor:pointer;font-family:var(--fb)}',
'.v21.b-pill .vbtn,.v21.b-pill .sb{border-radius:999px}.v21.b-square .vbtn,.v21.b-square .sb{border-radius:0;text-transform:uppercase;letter-spacing:.08em;font-size:13px}.v21.b-outline .vbtn,.v21.b-outline .sb{background:transparent;color:inherit!important;border-color:currentColor;border-radius:0;text-transform:uppercase;letter-spacing:.1em;font-size:12px}',
'.v21 .vbtn{background:var(--a)!important;border-color:var(--a)!important;color:var(--ab)!important}.v21.b-outline .vbtn,.v21 .vbtn.vbtn2{background:transparent!important;border-color:currentColor!important;color:inherit!important}.v21 .vx-block .vbtn{background:var(--ab)!important;color:var(--a)!important;border-color:var(--ab)!important}.v21 .vfoot .vbtn{background:var(--ff,var(--b))!important;color:var(--fb2,var(--t))!important;border-color:transparent!important}',
'.v21 .vx[style*="--hxf"]{color:var(--hxf)!important}.v21 h1,.v21 h2,.v21 h3,.v21 p,.v21 b{color:inherit}.v21 .vx h2,.v21 .vx p{color:inherit!important}.v21 .vx-full,.v21 .vx-center,.v21 .vx-m1{color:#fff!important}.v21 .vx-split,.v21 .vx-type,.v21 .vx-box{color:var(--t)!important}.v21 .vx-block{color:var(--ab)!important}.v21 .vcur{max-width:96px}',
'.v21 .vbtn2{background:transparent;color:inherit!important;border-color:currentColor}.v21 .vbtns{display:flex;gap:10px;flex-wrap:wrap}',
/* header */
'.v21 .vh{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:32px;padding:20px 48px;background:var(--hb,var(--b));color:var(--hf,var(--t));border-bottom:1px solid color-mix(in srgb,var(--t) 10%,transparent);z-index:5}.v21 .vh.vstick{position:sticky;top:0}',
'.v21 .vlogo{font-family:var(--fh);font-size:24px;font-weight:700;white-space:nowrap}.v21 .vnav{display:flex;gap:28px;font-size:14px;font-weight:500;justify-content:center;flex-wrap:wrap}.v21 .vnav a:hover{opacity:.6}.v21 .vic{display:flex;gap:18px;justify-content:flex-end}.v21 .vic span{cursor:pointer;display:inline-flex}',
'.v21 .vh-center{grid-template-columns:1fr auto 1fr}.v21 .vh-center .vnav{justify-content:flex-start}.v21 .vh-center .vlogo{font-size:28px}',
'.v21 .vh-stack{display:block;padding:18px 48px 0;text-align:center}.v21 .vh-stack .vstk1{display:grid;grid-template-columns:1fr auto 1fr;align-items:center}.v21 .vh-stack .vlogo{font-size:34px}.v21 .vh-stack .vnav{padding:16px 0;margin-top:12px;border-top:1px solid color-mix(in srgb,var(--t) 10%,transparent)}',
'.v21 .vh-dark{background:var(--hb,var(--t));color:var(--hf,var(--b));border:0}',
'.v21 .vh-pill{margin:14px 24px;border:1px solid color-mix(in srgb,var(--t) 12%,transparent);border-radius:999px;padding:14px 28px;box-shadow:0 6px 24px rgba(0,0,0,.06);top:10px}',
/* hero */
'.v21 .vx{position:relative;min-height:var(--ht);background-size:cover;background-position:center;color:#fff;display:flex;overflow:hidden}.v21 .vx h2{font-size:clamp(40px,5.6cqw,84px);line-height:1;margin:0 0 16px;max-width:13ch}.v21 .vx .vsub{font-size:18px;max-width:46ch;margin:0 0 26px;opacity:.92}.v21 .veyb{font-size:12px;letter-spacing:.18em;text-transform:uppercase;margin:0 0 14px;font-weight:600;opacity:.85}',
'.v21 .vx-ov{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,calc(var(--o) + .2)),rgba(0,0,0,var(--o)) 60%,rgba(0,0,0,calc(var(--o)*.4)))}',
'.v21 .vx-full{align-items:flex-end}.v21 .vx-full .vx-txt{position:relative;padding:64px 56px;max-width:760px}',
'.v21 .vx-center{align-items:center;justify-content:center;text-align:center}.v21 .vx-center .vx-txt{position:relative;padding:48px;display:flex;flex-direction:column;align-items:center}.v21 .vx-center h2{max-width:16ch}',
'.v21 .vx-split{display:grid;grid-template-columns:.9fr 1.1fr;color:var(--t);background:var(--s2)}.v21 .vx-split .vx-txt{padding:72px 56px;align-self:center}.v21 .vx-split .vx-img{background-size:cover;background-position:center;min-height:var(--ht)}',
'.v21 .vx-type{display:block;color:var(--t);background:var(--b);min-height:0}.v21 .vx-type .vx-typeh{padding:56px 48px 36px}.v21 .vx-type h2{font-size:clamp(56px,8cqw,128px);max-width:none;line-height:.92;letter-spacing:-.03em}.v21 .vx-type .vsub{max-width:52ch}.v21 .vx-strip{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:12px;padding:0 48px 12px}.v21 .vx-strip div{height:calc(var(--ht)*.62);background-size:cover;background-position:center;border-radius:var(--r)}',
'.v21 .vx-mosaic{display:grid;grid-template-columns:1.5fr 1fr;grid-template-rows:1fr 1fr;gap:10px;padding:10px;background:var(--b)}.v21 .vx-m1{grid-row:1/3;position:relative;background-size:cover;background-position:center;display:flex;align-items:flex-end;border-radius:var(--r);overflow:hidden}.v21 .vx-m1 .vx-txt{position:relative;padding:48px}.v21 .vx-m2,.v21 .vx-m3{background-size:cover;background-position:center;border-radius:var(--r)}',
'.v21 .vx-card{align-items:flex-end}.v21 .vx-box{position:relative;margin:56px;background:var(--b);color:var(--t);padding:40px 44px;max-width:460px;border-radius:var(--r)}.v21 .vx-box h2{font-size:clamp(32px,3.6cqw,52px)}.v21 .vx-box .vbtn2{display:none}',
'.v21 .vx-block{display:grid;grid-template-columns:1fr 1fr;background:var(--a);color:var(--ab);gap:0}.v21 .vx-block .vx-txt{padding:72px 56px;align-self:center}.v21 .vx-block .vx-img{padding:40px}.v21 .vx-block .vx-img div{height:100%;min-height:calc(var(--ht) - 80px);background-size:cover;background-position:center;border-radius:calc(var(--r) * 2 + 8px)}.v21 .vx-block .vbtn{background:var(--ab);color:var(--a)!important;border-color:var(--ab)}',
/* sections */
'.v21 .vsec{padding:72px 48px}.v21 .vsh{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:26px}.v21 .vsh h3{font-size:clamp(24px,2.6cqw,36px);margin:0}.v21 .vsh a{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:600;border-bottom:1px solid currentColor;padding-bottom:2px}',
'.v21 .vcg{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:16px}.v21 .vct{display:block}.v21 .vcti{aspect-ratio:4/5;overflow:hidden;border-radius:var(--r);background:var(--s2)}.v21 .vcti img,.v21 .vcti .vph{width:100%;height:100%;object-fit:cover;transition:transform .5s}.v21 .vct:hover img{transform:scale(1.04)}.v21 .vct span{display:block;margin-top:12px;font-weight:600}',
'.v21 .vc-overlay .vct{position:relative}.v21 .vc-overlay .vct span{position:absolute;left:0;right:0;bottom:0;margin:0;padding:40px 20px 18px;color:#fff;font-size:20px;font-family:var(--fh);background:linear-gradient(transparent,rgba(0,0,0,.55));border-radius:0 0 var(--r) var(--r)}',
'.v21 .vc-circles .vcti{aspect-ratio:1;border-radius:50%}.v21 .vc-circles .vct span{text-align:center}',
'.v21 .vg{display:grid;grid-template-columns:repeat(var(--c),minmax(0,1fr));gap:32px 18px}.v21 .vg.vcar{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}.v21 .vg.vcar .pc{flex:0 0 calc((100% - 54px)/4);scroll-snap-align:start}',
'.v21 .pc{display:block;cursor:pointer;background:transparent;border:0;padding:0;text-align:left;border-radius:0;box-shadow:none}.v21 .vpi{position:relative;aspect-ratio:4/5;overflow:hidden;background:var(--s2);border-radius:var(--r)}.v21 .vpi.sq{aspect-ratio:1}.v21 .vpi img,.v21 .vpi .vph{width:100%;height:100%;object-fit:cover;transition:transform .6s}.v21 .pc:hover .vpi img{transform:scale(1.05)}',
'.v21 .vpi .atc{position:absolute;left:12px;right:12px;bottom:12px;background:var(--b);color:var(--t);text-align:center;padding:10px;font-size:13px;font-weight:600;border-radius:var(--r);opacity:0;transform:translateY(6px);transition:.25s}.v21 .pc:hover .atc{opacity:1;transform:none}',
'.v21 .vsale{position:absolute;top:12px;left:12px;background:var(--a);color:var(--ab);font-style:normal;font-size:11px;font-weight:700;padding:4px 9px;letter-spacing:.04em;border-radius:calc(var(--r)/2)}',
'.v21 .vpm{padding:12px 2px 0;display:grid;gap:3px}.v21 .vpm b{font-weight:500;font-size:15px}.v21 .vpm span{font-size:14px;opacity:.8}.v21 .vpm s{opacity:.55;margin-left:4px}',
'.v21.c-border .pc{border:1px solid color-mix(in srgb,var(--t) 12%,transparent);padding:10px;border-radius:var(--r)}.v21.c-shadow .pc{background:var(--b);padding:10px;border-radius:calc(var(--r) + 4px);box-shadow:0 10px 30px rgba(0,0,0,.08)}.v21.c-tile .pc{background:var(--s2);padding:12px;border-radius:var(--r)}.v21.c-tile .vpi{background:color-mix(in srgb,var(--s2) 70%,#fff)}.v21.c-round .vpi{border-radius:22px}.v21.c-round .pc .vpm{text-align:center}',
'.v21 .vpromo{display:grid;grid-template-columns:1fr 1fr;background:var(--pb,var(--s2));color:var(--pf,var(--t))}.v21 .vpromo.vr .vpr-img{order:2}.v21 .vpr-img{min-height:540px;background-size:cover;background-position:center}.v21 .vpr-txt{padding:72px 64px;align-self:center;max-width:560px}.v21 .vpr-txt h3{font-size:clamp(30px,3.4cqw,48px);margin:0 0 14px;line-height:1.05}.v21 .vpr-txt p{font-size:17px;margin:0 0 26px;opacity:.85}',
'.v21 .vmq{overflow:hidden;white-space:nowrap;background:var(--mb,var(--t));color:var(--mf,var(--b));padding:16px 0;font-family:var(--fh);font-weight:700;text-transform:uppercase;letter-spacing:.02em}.v21 .vmq div{display:inline-block;animation:v21mq linear infinite}@keyframes v21mq{to{transform:translateX(-50%)}}',
'.v21 .vfeats{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:24px;padding:48px;border-top:1px solid color-mix(in srgb,var(--t) 10%,transparent);border-bottom:1px solid color-mix(in srgb,var(--t) 10%,transparent)}.v21 .vft{display:grid;gap:6px}.v21 .vft svg{color:var(--a)}.v21 .vft span{font-size:14px;opacity:.75}',
'.v21 .vlg{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:16px}.v21 .vlk{position:relative;aspect-ratio:3/4;background-size:cover;background-position:center;border-radius:var(--r);overflow:hidden;display:flex;align-items:flex-end}.v21 .vlk span{position:relative;padding:22px;color:#fff;font-family:var(--fh);font-size:24px;width:100%;background:linear-gradient(transparent,rgba(0,0,0,.5))}',
'.v21 .vstory{padding:96px 48px;text-align:center;display:flex;flex-direction:column;align-items:center}.v21 .vst{font-family:var(--fh);font-size:clamp(24px,2.8cqw,38px);line-height:1.3;max-width:30ch;margin:0 0 28px}',
'.v21 .vnews{background:var(--s2);text-align:center;padding:72px 32px}.v21 .vnews h3{font-size:32px;margin:0 0 8px}.v21 .vnews p{margin:0 0 22px;opacity:.8}.v21 .vnf{display:flex;gap:8px;max-width:460px;margin:0 auto}.v21 .vnf input{flex:1;padding:14px 16px;border:1px solid color-mix(in srgb,var(--t) 25%,transparent);background:var(--b);color:var(--t);border-radius:var(--r);font:inherit}.v21 .vnf.sm{margin:10px 0 0}.v21 .vnf.sm input{padding:10px}.v21 .vnf.sm .vbtn{padding:10px 16px}',
'.v21 .vfoot{background:var(--fb2,var(--t));color:var(--ff,var(--b));padding:64px 48px 28px}.v21 .vfg{display:grid;grid-template-columns:1.4fr 1fr 1fr 1.3fr;gap:32px}.v21 .vfg b{display:block;margin-bottom:12px;font-size:13px;text-transform:uppercase;letter-spacing:.1em;opacity:.7}.v21 .vfg a{display:block;margin-bottom:8px;opacity:.9}.v21 .vfg p{opacity:.75;max-width:32ch}.v21 .vfoot .vlogo{font-size:26px}.v21 .vfb{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:44px;padding-top:20px;border-top:1px solid color-mix(in srgb,currentColor 18%,transparent);font-size:13px;opacity:.8}.v21 .vpay{display:flex;gap:6px}.v21 .vpay i{font-style:normal;border:1px solid color-mix(in srgb,currentColor 30%,transparent);padding:2px 8px;border-radius:4px;font-size:11px}.v21 .vfoot .vnf input{background:transparent;color:inherit;border-color:color-mix(in srgb,currentColor 35%,transparent)}.v21 .vfoot .vbtn{background:var(--ff,var(--b));color:var(--fb2,var(--t))!important;border-color:transparent}',
'.v21 .vph{background:var(--s2)}.v21 .vempty{opacity:.7}',
'.v21 .vmain{max-width:1200px;margin:0 auto;padding:36px 24px}.v21 .vmain.home{max-width:none;padding:0}.v21 .vsrch{display:flex;align-items:center;gap:6px;border-bottom:1px solid color-mix(in srgb,currentColor 30%,transparent);padding:2px 0}.v21 .vsrch input{border:0;background:transparent;color:inherit;font:inherit;font-size:13px;width:110px;outline:none}.v21 .vcur{border:0;background:transparent;color:inherit;font:inherit;font-size:13px}.v21 .vcart{position:relative}.v21 .vcart i{position:absolute;top:-6px;right:-8px;background:var(--a);color:var(--ab);font-style:normal;font-size:10px;font-weight:700;border-radius:999px;min-width:16px;height:16px;display:grid;place-items:center}.v21.vlive .sfc img,.v21.vlive .sfc>div:first-child{border-radius:var(--r)!important}.v21.vlive .sfb{background:var(--a)!important;color:var(--ab)!important}.v21.vlive h1{font-size:34px}',
/* other pages inside a VendOm theme */
'.v21 .pg2,.v21 .car{gap:24px}.v21 .pc .pi{border-radius:var(--r)}.v21 .sx h1,.v21 .sx h2{font-family:var(--fh)}',
'@container (max-width:760px){.v21 .vsrch,.v21 .vcur{display:none!important}.v21 .vh{grid-template-columns:1fr auto;padding:14px 18px;gap:12px}.v21 .vh .vnav{display:none}.v21 .vh-center .vlogo,.v21 .vh-stack .vlogo{font-size:22px}.v21 .vh-stack{padding:14px 18px}.v21 .vh-pill{margin:10px;padding:10px 18px}.v21 .vx{min-height:calc(var(--ht)*.8)}.v21 .vx h2{font-size:40px}.v21 .vx-full .vx-txt,.v21 .vx-center .vx-txt{padding:32px 22px}.v21 .vx-split,.v21 .vx-block{grid-template-columns:1fr}.v21 .vx-split .vx-img{min-height:360px;order:-1}.v21 .vx-split .vx-txt,.v21 .vx-block .vx-txt{padding:36px 22px}.v21 .vx-block .vx-img{padding:0 22px 22px}.v21 .vx-block .vx-img div{min-height:320px}.v21 .vx-type .vx-typeh{padding:32px 18px 20px}.v21 .vx-type h2{font-size:56px}.v21 .vx-strip{grid-template-columns:1fr 1fr;padding:0 18px}.v21 .vx-strip div:nth-child(3){display:none}.v21 .vx-mosaic{grid-template-columns:1fr;grid-template-rows:auto}.v21 .vx-m1{grid-row:auto;min-height:440px}.v21 .vx-m2,.v21 .vx-m3{display:none}.v21 .vx-m1 .vx-txt{padding:28px 22px}.v21 .vx-box{margin:18px;padding:26px}.v21 .vsec{padding:44px 18px}.v21 .vcg{grid-template-columns:repeat(2,1fr)}.v21 .vg{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 12px}.v21 .vg.vcar .pc{flex:0 0 70%}.v21 .vpromo{grid-template-columns:1fr}.v21 .vpromo.vr .vpr-img{order:0}.v21 .vpr-img{min-height:340px}.v21 .vpr-txt{padding:36px 22px}.v21 .vfeats{grid-template-columns:repeat(2,1fr);padding:32px 18px}.v21 .vlg{grid-template-columns:1fr}.v21 .vlk{aspect-ratio:4/5}.v21 .vstory{padding:56px 22px}.v21 .vnf{flex-direction:column}.v21 .vfoot{padding:44px 18px 22px}.v21 .vfg{grid-template-columns:1fr 1fr}.v21 .vfg>div:first-child,.v21 .vfg>div:last-child{grid-column:1/-1}}',
/* admin: theme store */
'.ts-hd #p8bk{display:none}.ts-hd h1{font-size:28px;margin:0 0 22px}.ts-pag .ts-pb{display:inline-flex!important;align-items:center;justify-content:center;width:auto!important;padding:0 10px!important}',
'.ts-frame{width:100%;aspect-ratio:4/5;overflow:hidden;position:relative;background:#F4F4F4}.ts-in{width:1280px;pointer-events:none;transform-origin:0 0}',
'.ts,.tv{width:100%;box-sizing:border-box;max-width:1240px;margin:0 auto;padding:4px 8px 48px}.ts-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;font-size:13px}.ts-back{color:#005BD3;cursor:pointer}.ts-brand{font-weight:650;color:#303030}.ts h1{font-size:28px;margin:0 0 22px}',
'.ts-body{display:grid;grid-template-columns:230px minmax(0,1fr);gap:32px}.ts-fac{border-bottom:1px solid #E3E3E3;padding:12px 0}.ts-fac summary{font-weight:650;font-size:14px;cursor:pointer;margin-bottom:6px}.ts-opt{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 0;cursor:pointer;color:#303030}.ts-opt span{flex:1}.ts-opt em{font-style:normal;color:#8A8A8A;font-size:12px}',
'.ts-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;color:#616161;font-size:13px}.ts-sort{display:flex;gap:8px;align-items:center}.ts-sort select{padding:7px 10px;border:1px solid #D4D4D4;border-radius:8px;background:#fff;font:inherit}',
'.ts-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px 20px}.ts-grid.sm{padding:16px 18px;gap:18px}.ts-card{display:block;cursor:pointer;color:#1A1A1A;text-decoration:none}.ts-p{border:1px solid #E3E3E3;border-radius:12px;overflow:hidden;transition:box-shadow .2s,transform .2s}.ts-card:hover .ts-p{box-shadow:0 10px 30px rgba(0,0,0,.12);transform:translateY(-2px)}.ts-m{display:flex;justify-content:space-between;align-items:center;padding:10px 2px 0;font-size:14px}.ts-m span{color:#616161;font-size:13px}.ts-new{font-style:normal;background:#E8F5E9;color:#0C5132;padding:1px 7px;border-radius:6px;font-size:11px;font-weight:600;margin-left:6px}',
'.ts-pag{display:flex;justify-content:center;gap:6px;margin-top:32px}.ts-pb{min-width:34px;height:34px;border:1px solid #D4D4D4;background:#fff;border-radius:8px;cursor:pointer;font:inherit}.ts-pb.on{background:#1A1A1A;color:#fff;border-color:#1A1A1A}.ts-pb:disabled{opacity:.4;cursor:default}.ts-none{padding:60px;text-align:center;display:grid;gap:12px;justify-items:center}',
'.tv-body{display:grid;grid-template-columns:320px minmax(0,1fr);gap:36px}.tv-info h1{font-size:32px;margin:0 0 4px}.tv-price{font-weight:650;margin:0 0 10px}.tv-acts{display:flex;gap:8px;margin:16px 0 22px}.tv-info h4{margin:18px 0 8px;font-size:14px}.tv-pals{display:flex;gap:10px}.tv-pal{width:34px;height:34px;border-radius:50%;border:2px solid #fff;outline:1px solid;cursor:pointer}.tv-pal.on{outline-width:2px;outline-color:#1A1A1A!important}',
'.tv-det,.tv-feat{list-style:none;padding:0;margin:0;font-size:13px}.tv-det li{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid #EBEBEB}.tv-det b{font-weight:600}.tv-feat{columns:2}.tv-feat li{padding:3px 0}.tv-feat li:before{content:"✓ ";color:#2E7D32}',
'.tv-dev{display:flex;gap:4px;background:#EBEBEB;padding:3px;border-radius:9px;width:max-content;margin-bottom:12px}.tv-dev button{border:0;background:transparent;padding:6px 14px;border-radius:7px;cursor:pointer;font:inherit;font-size:13px}.tv-dev button.on{background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.12);font-weight:600}',
'.tv-desk{border:1px solid #E3E3E3;border-radius:12px;overflow:hidden;height:760px;overflow-y:auto}.tv-desk .ts-frame{aspect-ratio:auto;overflow:visible}.tv-desk .ts-in{pointer-events:auto}',
'.tv-phone{width:390px;height:780px;border:10px solid #1A1A1A;border-radius:44px;overflow:hidden;margin:0 auto;background:#fff}.tv-phone-in{height:100%;overflow-y:auto}',
/* admin: themes page */
'.v21p{width:100%;max-width:1080px;margin:0 auto}.v21cur{display:grid;grid-template-columns:minmax(0,1.5fr) 1fr;gap:24px;background:#fff;border:1px solid #E3E3E3;border-radius:14px;padding:18px;margin-bottom:18px}.v21cur-p .ts-frame{border-radius:10px;border:1px solid #EBEBEB;aspect-ratio:16/10}.v21cur-i{align-self:center}.v21cur-i h2{margin:8px 0 4px;font-size:24px}.v21live{background:#CDFEE1;color:#0C5132;font-size:12px;font-weight:600;padding:3px 9px;border-radius:8px}.v21acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}',
'.v21box{background:#fff;border:1px solid #E3E3E3;border-radius:14px;margin-bottom:18px;overflow:hidden}.v21box-h{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid #EBEBEB}.v21box-h h3{margin:0;font-size:15px}.v21row{display:grid;grid-template-columns:120px 1fr auto;gap:16px;align-items:center;padding:12px 18px;border-bottom:1px solid #F1F1F1}.v21row:last-child{border-bottom:0}.v21row-p .ts-frame{aspect-ratio:16/10;border-radius:8px;border:1px solid #EBEBEB}.v21row-i{display:grid;gap:2px}.v21row-a{display:flex;gap:6px;flex-wrap:wrap}',
'@media (max-width:900px){.ts-body{grid-template-columns:1fr}.ts-side{display:flex;gap:10px;overflow-x:auto}.ts-fac{min-width:200px;border:1px solid #E3E3E3;border-radius:10px;padding:10px;max-height:260px;overflow:auto}.ts-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 12px}.tv-body{grid-template-columns:1fr}.tv-desk{height:520px}.tv-phone{width:100%;max-width:390px}.v21cur{grid-template-columns:1fr}.v21row{grid-template-columns:80px 1fr}.v21row-a{grid-column:1/-1}}'
].join('');document.head.appendChild(css);
})();
