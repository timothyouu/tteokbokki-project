export type Stage = 'pick' | 'cook' | 'eat';
export const stations = ['Rice cakes & noodles', 'Savory favorites', 'Fresh vegetables'];
export const ingredients = [
 {id:'tteok',name:'Rice cakes',korean:'쌀떡',note:'Classic chewy rice cylinders',color:'#f9edcf',category:0,shape:'rice'},
 {id:'cheese_tteok',name:'Cheese rice cakes',korean:'치즈떡',note:'Soft rice cakes with a creamy center',color:'#f1ddaa',category:0,shape:'stuffed'},
 {id:'flat_tteok',name:'Sliced rice cakes',korean:'떡국떡',note:'Tender oval rice-cake slices',color:'#f3e7c9',category:0,shape:'slice'},
 {id:'ramen',name:'Ramyun',korean:'라면',note:'Springy curls that soak up the sauce',color:'#d9b35d',category:0,shape:'noodle'},
 {id:'glass',name:'Glass noodles',korean:'당면',note:'Slippery sweet-potato starch noodles',color:'#afaa86',category:0,shape:'glass'},
 {id:'fishcake',name:'Fish cakes',korean:'어묵',note:'Savory, softly folded sheets',color:'#c6995d',category:0,shape:'fold'},
 {id:'sausage',name:'Sausage',korean:'소시지',note:'Smoky, scored little sausages',color:'#a8482e',category:1,shape:'rice'},
 {id:'shrimp',name:'Shrimp',korean:'새우',note:'Sweet, plump seafood bites',color:'#e8a080',category:1,shape:'shrimp'},
 {id:'fishball',name:'Fish balls',korean:'피시볼',note:'Bouncy, gently savory fish balls',color:'#e7d4ab',category:1,shape:'ball'},
 {id:'mandu',name:'Fried mandu',korean:'만두',note:'Pleated dumplings with crisp edges',color:'#d1a364',category:1,shape:'dumpling'},
 {id:'egg',name:'Boiled eggs',korean:'삶은 달걀',note:'Halved eggs with a golden yolk',color:'#f8ebce',category:1,shape:'egg'},
 {id:'cheese',name:'Mozzarella',korean:'모차렐라',note:'A mellow, melty finishing touch',color:'#ead39a',category:1,shape:'cheese'},
 {id:'enoki',name:'Enoki mushrooms',korean:'팽이버섯',note:'Fine stems and delicate little caps',color:'#e7d8b3',category:2,shape:'mushroom'},
 {id:'shiitake',name:'Shiitake mushrooms',korean:'표고버섯',note:'Earthy mushrooms with meaty caps',color:'#76513a',category:2,shape:'shiitake'},
 {id:'bokchoy',name:'Bok choy',korean:'청경채',note:'Leafy greens with a tender white stem',color:'#467745',category:2,shape:'leaf'},
 {id:'cabbage',name:'Cabbage',korean:'양배추',note:'Sweet, ruffled cabbage leaves',color:'#bbc17b',category:2,shape:'cabbage'},
 {id:'scallion',name:'Scallions',korean:'대파',note:'Fresh-cut green onion rings',color:'#699652',category:2,shape:'rings'},
 {id:'onion',name:'Onion',korean:'양파',note:'Thin, sweet onion crescents',color:'#e5dbc0',category:2,shape:'onion'},
] as const;
export type IngredientId = typeof ingredients[number]['id'];
export type Selection = Record<IngredientId, number>;
export const emptySelection = (): Selection => Object.fromEntries(ingredients.map(i=>[i.id,0])) as Selection;
export const totalPortions = (selection: Selection): number => Object.values(selection).reduce((a,b)=>a+b,0);
export const sauces = [
 {name:'Classic gochujang',note:'Sweet, savory & fiery',color:'#a52f16'},
 {name:'Rosé cream',note:'Creamy & comforting',color:'#c86a43'},
 {name:'Soy garlic',note:'Savory & gently sweet',color:'#704122'},
 {name:'Jjajang',note:'Deep, savory black bean',color:'#35231a'},
];
