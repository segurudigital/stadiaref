var r={booted:!1,queue:[],resolveReady:null,legacyEmit:null,profile:"generic",warnedProfiles:{},hostScriptEl:null,config:null,state:null,classConverterEnabled:null,autoRefEnabled:null,autoRefDepth:null,outlineMode:null,tiers:{section:!0,block:!0,element:!0},autoAddresses:null,autoCounter:0,keys:null,leaveMode:null,keyActions:null,presentationMode:null,theme:null,resolvedTheme:"light",darkMediaQuery:null,currentUser:null,_initialDock:null,position:null,layer:null,slotted:null,slotObserver:null,placeScheduled:!1,clipVersion:0,coverTimer:null,placeHighlights:null,shadowHost:null,shadowRoot:null,mounted:!1,records:new WeakMap,shadowCss:null,toolbar:null,toast:null,toastTimer:null,visibilityRecheckScheduled:!1,treeOpen:!1,treeJumpTimer:null,highlights:null,highlightTracking:!1,treePanel:null,treeRows:null,treeUi:null,treeView:null,treeRefs:null,treeProblems:null,treeMode:"overlay",treeWidth:0,activeRefTreeOpen:!1,activeRefTreePinned:!1,activeRefTreeHideTimer:null,activeRefTree:null,htmlClassObserver:null,watch:!0,observer:null,pendingWork:null,workScheduled:!1,navListening:!1,scopeModal:null,dialogStatus:null,dockOffset:null,mountSelector:null,mountHost:null,mountRoot:null,warnedMount:!1,lastPointerType:null,finePointerSeen:!1,pickSheet:null,clickMode:"card",hintEnabled:!0,hint:null,hintTarget:null,hintTimer:null,hintX:0,hintY:0,card:null,lookup:null,onAddress:null,drillEnabled:!0,drillRoot:null,drillBar:null,panel:null,panelListening:!1,afterSurvey:null};var ee="3.4.0",k="'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace",R="-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",tt={0:"Icons",1:"Off",2:"Full"},de={off:"Off",section:"Sections",block:"Blocks"};var rt='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20" aria-hidden="true" focusable="false" class="stadiaref-brand__icon"><defs><clipPath id="stadiaref-icon-clip"><circle cx="256" cy="256" r="256"/></clipPath></defs><g clip-path="url(#stadiaref-icon-clip)"><circle class="stadiaref-brand__disc" cx="256" cy="256" r="256"/><path fill="#000" d="M328.35,158.25c0,39.96-32.39,72.35-72.35,72.35s-72.35-32.39-72.35-72.35,32.39-72.35,72.35-72.35,72.35,32.39,72.35,72.35M141.19,624.36h0v520.12c0,69.87,30.78,120.8,92.17,128.41v63.09h44.33v-63.09c61.39-7.61,92.17-58.54,92.17-128.41V480.38c0-50.17-16.33-91-46.67-112,14-17.5,29.17-31.49,29.17-57.78,0-17.25-4.37-38.67-26.63-58.37,28.72-21.35,47.41-55.43,47.41-93.97,0-64.7-52.45-117.15-117.15-117.15s-117.15,52.45-117.15,117.15,52.45,117.15,117.15,117.15c8.86,0,17.46-1.07,25.75-2.93,12.7,9.57,20.26,21.05,21.32,31.55,2.55,25.37-19.72,42.73-59.21,83.02-59.5,61.84-77,81.67-87.5,109.67-11.67,28-15.17,65.33-15.17,112v15.65h0Z M185.52,1105.92h0v-513.54c0-77,23.33-102.67,88.67-171.51,4.67-5.83,10.5-11.67,17.5-18.67,25.67,15.17,33.83,50.17,33.83,110.84v598.76c0,81.67-14,117.84-70,117.84s-70-36.17-70-117.84v-5.88h0Z"/></g></svg>',at='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -72 434 74" width="65" height="11" aria-hidden="true" focusable="false" class="stadiaref-brand__logotype"><path class="stadiaref-brand__stadia" d="M30.1 0.8Q22.1 0.8 16.1 -1.75Q10.1 -4.3 6.85 -9.05Q3.6 -13.8 3.6 -20.1L3.6 -20.1L3.6 -22.3Q3.6 -22.8 3.95 -23.15Q4.3 -23.5 4.8 -23.5L4.8 -23.5L16.2 -23.5Q16.7 -23.5 17.05 -23.15Q17.4 -22.8 17.4 -22.3L17.4 -22.3L17.4 -20.8Q17.4 -16.8 21.1 -14.05Q24.8 -11.3 31.1 -11.3L31.1 -11.3Q36.4 -11.3 39 -13.55Q41.6 -15.8 41.6 -19.1L41.6 -19.1Q41.6 -21.5 40 -23.15Q38.4 -24.8 35.65 -26.05Q32.9 -27.3 26.9 -29.5L26.9 -29.5Q20.2 -31.8 15.55 -34.2Q10.9 -36.6 7.75 -40.75Q4.6 -44.9 4.6 -51L4.6 -51Q4.6 -57 7.7 -61.5Q10.8 -66 16.3 -68.4Q21.8 -70.8 29 -70.8L29 -70.8Q36.6 -70.8 42.55 -68.1Q48.5 -65.4 51.85 -60.55Q55.2 -55.7 55.2 -49.3L55.2 -49.3L55.2 -47.8Q55.2 -47.3 54.85 -46.95Q54.5 -46.6 54 -46.6L54 -46.6L42.5 -46.6Q42 -46.6 41.65 -46.95Q41.3 -47.3 41.3 -47.8L41.3 -47.8L41.3 -48.6Q41.3 -52.8 37.85 -55.75Q34.4 -58.7 28.4 -58.7L28.4 -58.7Q23.7 -58.7 21.05 -56.7Q18.4 -54.7 18.4 -51.2L18.4 -51.2Q18.4 -48.7 19.95 -47Q21.5 -45.3 24.55 -43.95Q27.6 -42.6 34 -40.3L34 -40.3Q41.1 -37.7 45.15 -35.7Q49.2 -33.7 52.45 -29.75Q55.7 -25.8 55.7 -19.5L55.7 -19.5Q55.7 -10.1 48.8 -4.65Q41.9 0.8 30.1 0.8L30.1 0.8M93.53 -41.3Q93.53 -40.8 93.18 -40.45Q92.83 -40.1 92.33 -40.1L92.33 -40.1L82.73 -40.1Q82.23 -40.1 82.23 -39.6L82.23 -39.6L82.23 -18.4Q82.23 -15.1 83.58 -13.5Q84.93 -11.9 87.93 -11.9L87.93 -11.9L91.23 -11.9Q91.73 -11.9 92.08 -11.55Q92.43 -11.2 92.43 -10.7L92.43 -10.7L92.43 -1.2Q92.43 -0.1 91.23 0.1L91.23 0.1Q87.03 0.3 85.23 0.3L85.23 0.3Q76.93 0.3 72.83 -2.45Q68.73 -5.2 68.63 -12.8L68.63 -12.8L68.63 -39.6Q68.63 -40.1 68.13 -40.1L68.13 -40.1L62.43 -40.1Q61.93 -40.1 61.58 -40.45Q61.23 -40.8 61.23 -41.3L61.23 -41.3L61.23 -50.2Q61.23 -50.7 61.58 -51.05Q61.93 -51.4 62.43 -51.4L62.43 -51.4L68.13 -51.4Q68.63 -51.4 68.63 -51.9L68.63 -51.9L68.63 -63.8Q68.63 -64.3 68.98 -64.65Q69.33 -65 69.83 -65L69.83 -65L81.03 -65Q81.53 -65 81.88 -64.65Q82.23 -64.3 82.23 -63.8L82.23 -63.8L82.23 -51.9Q82.23 -51.4 82.73 -51.4L82.73 -51.4L92.33 -51.4Q92.83 -51.4 93.18 -51.05Q93.53 -50.7 93.53 -50.2L93.53 -50.2L93.53 -41.3M121.87 -52.2Q128.37 -52.2 133.47 -49.95Q138.57 -47.7 141.42 -43.8Q144.27 -39.9 144.27 -35.1L144.27 -35.1L144.27 -1.2Q144.27 -0.7 143.92 -0.35Q143.57 0 143.07 0L143.07 0L131.37 0Q130.87 0 130.52 -0.35Q130.17 -0.7 130.17 -1.2L130.17 -1.2L130.17 -4.5Q130.17 -4.8 129.97 -4.9Q129.77 -5 129.57 -4.7L129.57 -4.7Q125.37 0.8 116.07 0.8L116.07 0.8Q108.27 0.8 103.47 -3Q98.67 -6.8 98.67 -14.2L98.67 -14.2Q98.67 -21.9 104.07 -26.15Q109.47 -30.4 119.47 -30.4L119.47 -30.4L129.67 -30.4Q130.17 -30.4 130.17 -30.9L130.17 -30.9L130.17 -33.1Q130.17 -36.4 128.17 -38.25Q126.17 -40.1 122.17 -40.1L122.17 -40.1Q119.07 -40.1 117.02 -39Q114.97 -37.9 114.37 -35.9L114.37 -35.9Q114.07 -34.8 113.07 -34.9L113.07 -34.9L100.97 -36.5Q99.77 -36.7 99.87 -37.4L99.87 -37.4Q100.27 -41.6 103.22 -45Q106.17 -48.4 111.02 -50.3Q115.87 -52.2 121.87 -52.2L121.87 -52.2M119.87 -9.7Q124.17 -9.7 127.17 -12Q130.17 -14.3 130.17 -17.9L130.17 -17.9L130.17 -21.5Q130.17 -22 129.67 -22L129.67 -22L122.47 -22Q117.97 -22 115.42 -20.3Q112.87 -18.6 112.87 -15.5L112.87 -15.5Q112.87 -12.8 114.77 -11.25Q116.67 -9.7 119.87 -9.7L119.87 -9.7M185.4 -68.8Q185.4 -69.3 185.75 -69.65Q186.1 -70 186.6 -70L186.6 -70L198.3 -70Q198.8 -70 199.15 -69.65Q199.5 -69.3 199.5 -68.8L199.5 -68.8L199.5 -1.2Q199.5 -0.7 199.15 -0.35Q198.8 0 198.3 0L198.3 0L186.6 0Q186.1 0 185.75 -0.35Q185.4 -0.7 185.4 -1.2L185.4 -1.2L185.4 -4.5Q185.4 -4.8 185.2 -4.85Q185 -4.9 184.8 -4.7L184.8 -4.7Q180.6 0.8 173.3 0.8L173.3 0.8Q166.3 0.8 161.25 -3.1Q156.2 -7 154 -13.8L154 -13.8Q152.3 -19 152.3 -25.9L152.3 -25.9Q152.3 -33 154.1 -38.3L154.1 -38.3Q156.4 -44.7 161.35 -48.45Q166.3 -52.2 173.6 -52.2L173.6 -52.2Q180.8 -52.2 184.8 -47.2L184.8 -47.2Q185 -46.9 185.2 -47Q185.4 -47.1 185.4 -47.4L185.4 -47.4L185.4 -68.8M183.3 -15.6Q185.3 -19.3 185.3 -25.7L185.3 -25.7Q185.3 -32.4 183.1 -36.2L183.1 -36.2Q180.8 -40.1 176.4 -40.1L176.4 -40.1Q171.7 -40.1 169.3 -36.2L169.3 -36.2Q166.8 -32.3 166.8 -25.6L166.8 -25.6Q166.8 -19.6 168.9 -15.6L168.9 -15.6Q171.4 -11.3 176.3 -11.3L176.3 -11.3Q180.8 -11.3 183.3 -15.6L183.3 -15.6M217.03 -57.2Q213.63 -57.2 211.38 -59.45Q209.13 -61.7 209.13 -65.1L209.13 -65.1Q209.13 -68.6 211.33 -70.8Q213.53 -73 217.03 -73L217.03 -73Q220.53 -73 222.73 -70.8Q224.93 -68.6 224.93 -65.1L224.93 -65.1Q224.93 -61.7 222.68 -59.45Q220.43 -57.2 217.03 -57.2L217.03 -57.2M211.03 0Q210.53 0 210.18 -0.35Q209.83 -0.7 209.83 -1.2L209.83 -1.2L209.83 -50.3Q209.83 -50.8 210.18 -51.15Q210.53 -51.5 211.03 -51.5L211.03 -51.5L222.73 -51.5Q223.23 -51.5 223.58 -51.15Q223.93 -50.8 223.93 -50.3L223.93 -50.3L223.93 -1.2Q223.93 -0.7 223.58 -0.35Q223.23 0 222.73 0L222.73 0L211.03 0M254.77 -52.2Q261.27 -52.2 266.37 -49.95Q271.47 -47.7 274.32 -43.8Q277.17 -39.9 277.17 -35.1L277.17 -35.1L277.17 -1.2Q277.17 -0.7 276.82 -0.35Q276.47 0 275.97 0L275.97 0L264.27 0Q263.77 0 263.42 -0.35Q263.07 -0.7 263.07 -1.2L263.07 -1.2L263.07 -4.5Q263.07 -4.8 262.87 -4.9Q262.67 -5 262.47 -4.7L262.47 -4.7Q258.27 0.8 248.97 0.8L248.97 0.8Q241.17 0.8 236.37 -3Q231.57 -6.8 231.57 -14.2L231.57 -14.2Q231.57 -21.9 236.97 -26.15Q242.37 -30.4 252.37 -30.4L252.37 -30.4L262.57 -30.4Q263.07 -30.4 263.07 -30.9L263.07 -30.9L263.07 -33.1Q263.07 -36.4 261.07 -38.25Q259.07 -40.1 255.07 -40.1L255.07 -40.1Q251.97 -40.1 249.92 -39Q247.87 -37.9 247.27 -35.9L247.27 -35.9Q246.97 -34.8 245.97 -34.9L245.97 -34.9L233.87 -36.5Q232.67 -36.7 232.77 -37.4L232.77 -37.4Q233.17 -41.6 236.12 -45Q239.07 -48.4 243.92 -50.3Q248.77 -52.2 254.77 -52.2L254.77 -52.2M252.77 -9.7Q257.07 -9.7 260.07 -12Q263.07 -14.3 263.07 -17.9L263.07 -17.9L263.07 -21.5Q263.07 -22 262.57 -22L262.57 -22L255.37 -22Q250.87 -22 248.32 -20.3Q245.77 -18.6 245.77 -15.5L245.77 -15.5Q245.77 -12.8 247.67 -11.25Q249.57 -9.7 252.77 -9.7L252.77 -9.7"/><path class="stadiaref-brand__ref" d="M325.7 0Q324.7 0 324.3 -0.9L324.3 -0.9L311.8 -28.6Q311.6 -29 311.2 -29L311.2 -29L301.9 -29Q301.4 -29 301.4 -28.5L301.4 -28.5L301.4 -1.2Q301.4 -0.7 301.05 -0.35Q300.7 0 300.2 0L300.2 0L288.5 0Q288 0 287.65 -0.35Q287.3 -0.7 287.3 -1.2L287.3 -1.2L287.3 -68.8Q287.3 -69.3 287.65 -69.65Q288 -70 288.5 -70L288.5 -70L317.1 -70Q323.5 -70 328.35 -67.4Q333.2 -64.8 335.85 -60Q338.5 -55.2 338.5 -48.9L338.5 -48.9Q338.5 -42.1 335.1 -37.25Q331.7 -32.4 325.6 -30.4L325.6 -30.4Q325.1 -30.2 325.3 -29.7L325.3 -29.7L338.9 -1.4Q339.1 -1 339.1 -0.8L339.1 -0.8Q339.1 0 338 0L338 0L325.7 0M301.9 -57.9Q301.4 -57.9 301.4 -57.4L301.4 -57.4L301.4 -40.3Q301.4 -39.8 301.9 -39.8L301.9 -39.8L315 -39.8Q319.2 -39.8 321.85 -42.3Q324.5 -44.8 324.5 -48.8L324.5 -48.8Q324.5 -52.8 321.85 -55.35Q319.2 -57.9 315 -57.9L315 -57.9L301.9 -57.9M391.93 -31Q392.53 -27.2 392.33 -22.5L392.33 -22.5Q392.23 -21.3 391.03 -21.3L391.03 -21.3L360.13 -21.3Q359.53 -21.3 359.73 -20.8L359.73 -20.8Q360.03 -18.8 360.83 -16.8L360.83 -16.8Q363.43 -11.2 371.43 -11.2L371.43 -11.2Q377.83 -11.3 381.53 -16.4L381.53 -16.4Q381.93 -17 382.43 -17L382.43 -17Q382.73 -17 383.13 -16.6L383.13 -16.6L390.33 -9.5Q390.83 -9 390.83 -8.6L390.83 -8.6Q390.83 -8.4 390.43 -7.8L390.43 -7.8Q387.13 -3.7 381.93 -1.45Q376.73 0.8 370.53 0.8L370.53 0.8Q361.93 0.8 355.98 -3.1Q350.03 -7 347.43 -14L347.43 -14Q345.33 -19 345.33 -27.1L345.33 -27.1Q345.33 -32.6 346.83 -36.8L346.83 -36.8Q349.13 -43.9 354.88 -48.1Q360.63 -52.3 368.53 -52.3L368.53 -52.3Q378.53 -52.3 384.58 -46.5Q390.63 -40.7 391.93 -31L391.93 -31M368.63 -40.1Q362.33 -40.1 360.33 -34.2L360.33 -34.2Q359.93 -32.9 359.63 -31L359.63 -31Q359.63 -30.5 360.13 -30.5L360.13 -30.5L377.43 -30.5Q378.03 -30.5 377.83 -31L377.83 -31Q377.33 -33.9 377.33 -33.8L377.33 -33.8Q376.43 -36.8 374.18 -38.45Q371.93 -40.1 368.63 -40.1L368.63 -40.1M428.47 -51.5Q428.97 -51.5 429.32 -51.15Q429.67 -50.8 429.67 -50.3L429.67 -50.3L429.67 -40.8Q429.67 -40.3 429.32 -39.95Q428.97 -39.6 428.47 -39.6L428.47 -39.6L418.77 -39.6Q418.27 -39.6 418.27 -39.1L418.27 -39.1L418.27 -1.2Q418.27 -0.7 417.92 -0.35Q417.57 0 417.07 0L417.07 0L405.37 0Q404.87 0 404.52 -0.35Q404.17 -0.7 404.17 -1.2L404.17 -1.2L404.17 -39.1Q404.17 -39.6 403.67 -39.6L403.67 -39.6L397.77 -39.6Q397.27 -39.6 396.92 -39.95Q396.57 -40.3 396.57 -40.8L396.57 -40.8L396.57 -50.3Q396.57 -50.8 396.92 -51.15Q397.27 -51.5 397.77 -51.5L397.77 -51.5L403.67 -51.5Q404.17 -51.5 404.17 -52L404.17 -52L404.17 -54.2Q404.17 -60.4 406.07 -63.85Q407.97 -67.3 412.22 -68.75Q416.47 -70.2 423.97 -70L423.97 -70L427.77 -70Q428.27 -70 428.62 -69.65Q428.97 -69.3 428.97 -68.8L428.97 -68.8L428.97 -60.7Q428.97 -60.2 428.62 -59.85Q428.27 -59.5 427.77 -59.5L427.77 -59.5L424.47 -59.5Q420.97 -59.4 419.62 -58.05Q418.27 -56.7 418.27 -53.1L418.27 -53.1L418.27 -52Q418.27 -51.5 418.77 -51.5L418.77 -51.5L428.47 -51.5"/></svg>';function h(e,t){var a;for(a=0;a<e.length;a++)t(e[a],a)}function te(e){var t=[];return h(e,function(a){t.push(a)}),t}function ot(e,t){var a;for(a=0;a<e.length;a++)if(e[a]===t)return!0;return!1}function T(e,t,a){a?e.classList.add(t):e.classList.remove(t)}function zr(e,t,a){return!(e.right+a<=t.left||e.left>=t.right+a||e.bottom+a<=t.top||e.top>=t.bottom+a)}function V(e){if(!e)return!1;for(var t=[r.shadowHost,r.mountHost],a=0;a<t.length;a++)if(t[a]&&(e===t[a]||t[a].contains(e)))return!0;return!1}function jt(e,t){for(;e&&e!==r.shadowHost&&e!==document&&e.nodeType===1;){if(Kt(e,t))return e;e=e.parentElement}return null}function Kt(e,t){var a=e.matches||e.msMatchesSelector||e.webkitMatchesSelector||e.mozMatchesSelector;return a?a.call(e,t):!1}function p(e){var t=r.records.get(e);return t||(t={},r.records.set(e,t)),t}function O(e){return r.records.has(e)}function Ir(e){r.records.delete(e)}function fe(e){!e||!e.parentNode||e.parentNode.removeChild(e)}import{classify as qr,hasProfile as Mo,DEFAULT_PROFILE as Do}from"./core.mjs";function Ho(e){return e==="section"||e==="block"||e==="element"||e==="unclassified"?e:"unclassified"}function it(){return Mo(r.profile)?r.profile:Do}function No(e){return e.hasAttribute("data-ref")&&!e.hasAttribute("data-stadiaref-auto")}function Ur(e){for(var t=0,a=e.parentElement;a;a=a.parentElement)No(a)&&t++;return{depth:t,hasAddressedChildren:!!e.querySelector("[data-ref]:not([data-stadiaref-auto])")}}function _(e){var t=e.getAttribute("data-stadiaref-auto-tier");return t?Ho(t):qr(e.getAttribute("data-ref"),{profile:it(),context:Ur(e)})}function zo(e){for(var t=document.querySelectorAll("[data-ref]"),a=0;a<t.length;a++)if(t[a].getAttribute("data-ref")===e)return t[a];return null}function Wr(e){var t=typeof e=="string"&&typeof document<"u"?zo(e):null;return qr(e,{profile:it(),context:t?Ur(t):void 0})}function nt(e,t){if(!(typeof window>"u"||!window.dispatchEvent))try{var a;if(typeof CustomEvent=="function")a=new CustomEvent(e,{detail:t||{},bubbles:!1,cancelable:!1});else if(document.createEvent)a=document.createEvent("CustomEvent"),a.initCustomEvent(e,!1,!1,t||{});else return;window.dispatchEvent(a)}catch{}}function y(e,t,a){nt("stadiaref:"+e,t||{}),r.legacyEmit&&r.legacyEmit(e,a||t||{})}function $(e,t,a,o,i){var n={address:a,tier:_(t),element:t};if(i)for(var s in i)Object.prototype.hasOwnProperty.call(i,s)&&(n[s]=i[s]);y("address-"+e,n,{dataRef:a,element:t,current:o})}function Yt(e,t){r.toast.setAttribute("role","status"),r.toast.textContent=(t===!1?"Could not copy: ":"Copied: ")+e,r.toast.classList.add("stadiaref-toast--visible"),clearTimeout(r.toastTimer),r.toastTimer=setTimeout(function(){r.toast.classList.remove("stadiaref-toast--visible")},1800)}function Xt(e){function t(){var a=Io(e);return Yt(e,a),a}if(navigator.clipboard&&navigator.clipboard.writeText)try{return navigator.clipboard.writeText(e).then(function(){return Yt(e,!0),!0},t)}catch{return Promise.resolve(t())}return Promise.resolve(t())}function Io(e){var t=document.createElement("textarea"),a=document.activeElement;t.value=e,t.setAttribute("readonly",""),t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select();var o=!1;try{o=document.execCommand("copy")}catch{o=!1}if(document.body.removeChild(t),a&&a.focus)try{a.focus()}catch{}return!!o}function Q(e,t,a,o){return Xt(t).then(function(i){return $("click",e,t,a,{source:o,copied:i}),i})}function P(e,t){if(!(!r.shadowRoot||!t)){r.highlights||(r.highlights={});var a=r.highlights[e];a||(a={box:document.createElement("div"),el:null},a.box.className="stadiaref-highlight stadiaref-highlight--"+e,a.box.setAttribute("aria-hidden","true"),r.shadowRoot.appendChild(a.box),r.highlights[e]=a),a.el=t,a.box.hidden=!1,G(),qo()}}function L(e){var t=r.highlights&&r.highlights[e];t&&(t.el=null,t.box.hidden=!0)}function G(){if(r.highlights)for(var e in r.highlights){var t=r.highlights[e];if(t.el){if(!t.el.isConnected){L(e);continue}var a=t.el.getBoundingClientRect();t.box.style.top=a.top+"px",t.box.style.left=a.left+"px",t.box.style.width=a.width+"px",t.box.style.height=a.height+"px"}}}function qo(){r.highlightTracking||(r.highlightTracking=!0,window.addEventListener("scroll",G,!0),window.addEventListener("resize",G))}var Jt={light:{barBg:"#FFFFFF",barBd:"#E5E7EB",fg:"#111827",key:"#6B7280",pillBg:"#F9FAFB",accent:"#3F6212",wash:"rgba(163, 230, 53, 0.16)",washBd:"rgba(63, 98, 18, 0.3)",ring:"rgba(63, 98, 18, 0.55)",ringGlow:"rgba(163, 230, 53, 0.3)",util:"#4B5563",diagBg:"rgba(17, 24, 39, 0.05)",dot:"#A3E635",dotRing:"#3F6212",dotOff:"rgba(17, 24, 39, 0.22)",avatarBg:"#111827",refFg:"#3F6212",desc:"#6B7280",hover:"#F9FAFB",tickOnBd:"#3F6212",tickOnBg:"#A3E635",tickOnFg:"#000000",tickOffBd:"#6B7280",tickOffBg:"#FFFFFF",autoBd:"#6B7280",autoFg:"#374151",tipBg:"#111827",tipFg:"#F7FEE7",rowHover:"#F7FEE7",rowHoverFg:"#3F6212",chipBg:"#F3F4F6",chipFg:"#374151",muted:"#4B5563",focus:"#00707E",focusHalo:"#FFFFFF",toastBg:"#F7FEE7",toastFg:"#3F6212",toastBd:"rgba(63, 98, 18, 0.4)",pinOnBg:"rgba(163, 230, 53, 0.16)",pinOnFg:"#3F6212",pinOnBd:"rgba(63, 98, 18, 0.5)",statusBg:"#F7FEE7",statusFg:"#3F6212",okFg:"#3F6212",warnFg:"#92400E",errorFg:"#B91C1C",copyBg:"#A3E635",copyFg:"#000000",copyBd:"#3F6212"},dark:{barBg:"#27272A",barBd:"#3F3F46",fg:"#F4F4F5",key:"#A1A1AA",pillBg:"rgba(255, 255, 255, 0.07)",accent:"#A3E635",wash:"rgba(163, 230, 53, 0.14)",washBd:"rgba(163, 230, 53, 0.36)",ring:"rgba(163, 230, 53, 0.6)",ringGlow:"rgba(163, 230, 53, 0.2)",util:"#D4D4D8",diagBg:"rgba(255, 255, 255, 0.08)",dot:"#A3E635",dotRing:"transparent",dotOff:"rgba(255, 255, 255, 0.24)",avatarBg:"#71717A",refFg:"#A3E635",desc:"#A1A1AA",hover:"rgba(255, 255, 255, 0.06)",tickOnBd:"#A3E635",tickOnBg:"#A3E635",tickOnFg:"#000000",tickOffBd:"#A1A1AA",tickOffBg:"transparent",autoBd:"#A1A1AA",autoFg:"#E4E4E7",tipBg:"#F4F4F5",tipFg:"#111827",rowHover:"rgba(163, 230, 53, 0.14)",rowHoverFg:"#A3E635",chipBg:"#3F3F46",chipFg:"#E4E4E7",muted:"#D4D4D8",focus:"#00C0F3",focusHalo:"#000000",toastBg:"#27272A",toastFg:"#A3E635",toastBd:"rgba(163, 230, 53, 0.36)",pinOnBg:"rgba(163, 230, 53, 0.14)",pinOnFg:"#A3E635",pinOnBd:"rgba(163, 230, 53, 0.5)",statusBg:"#27272A",statusFg:"#A3E635",okFg:"#A3E635",warnFg:"#FBBF24",errorFg:"#FCA5A5",copyBg:"#A3E635",copyFg:"#000000",copyBd:"#A3E635"}};var Qe={section:{tag:"SEC",bg:"#A3E635",fg:"#000000",bd:"#3F6212"},block:{tag:"BLK",bg:"#111827",fg:"#F7FEE7",bd:"#111827"},element:{tag:"EL",bg:"#FFFFFF",fg:"#111827",bd:"#6B7280"},unclassified:{tag:"?",bg:"#FFFBEB",fg:"#92400E",bd:"#B45309"}};var Vr=3;function $r(e){var t=[],a={},o=[];return e.forEach(function(i){i.auto||(a[i.address]||(a[i.address]=[],o.push(i.address)),a[i.address].push(i))}),o.forEach(function(i){var n=a[i];n.length>1&&t.push({kind:"duplicate",address:i,count:n.length,items:n})}),o.forEach(function(i){var n=a[i][0];n.tier==="unclassified"&&t.push({kind:"unclassified",address:i,items:[n]})}),t=t.concat(Uo(o,a)),t}function Uo(e,t){var a={},o=[];e.forEach(function(n){for(var s=n.split("-"),l=s.length-1;l>=0;l--)if(/^\d+$/.test(s[l])){var d=s.slice(0,l).join("-")+"\0"+s.slice(l+1).join("-");a[d]||(a[d]={head:s.slice(0,l),tail:s.slice(l+1),width:s[l].length,nums:{}},o.push(d)),a[d].nums[parseInt(s[l],10)]=t[n][0];break}});var i=[];return o.forEach(function(n){var s=a[n],l=Object.keys(s.nums).map(Number).sort(function(v,x){return v-x});if(!(l.length<2))for(var d=1;d<l.length;d++){var f=l[d-1],c=l[d];if(!(c-f<2)){for(var g=[],u=f+1;u<c;u++)g.push(u);var m=g.slice(0,Vr).map(function(v){return Wo(s,v)});i.push({kind:"gap",address:m[0],missing:m,more:Math.max(0,g.length-Vr),before:s.nums[f],after:s.nums[c],items:[s.nums[c]]})}}}),i}function Wo(e,t){for(var a=String(t);a.length<e.width;)a="0"+a;return e.head.concat([a],e.tail).join("-")}function Kr(){r.treeJumpTimer&&(clearTimeout(r.treeJumpTimer),r.treeJumpTimer=null),L("jump")}function Yr(){L("hover"),r.treePanel&&h(r.treePanel.querySelectorAll(".stadiaref-tree-row--active"),function(e){e.classList.remove("stadiaref-tree-row--active")})}function Vo(e){Kr();try{e.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"})}catch{e.scrollIntoView()}P("jump",e);var t=Date.now();(function a(){G(),Date.now()-t<600&&requestAnimationFrame(a)})(),r.treeJumpTimer=setTimeout(function(){L("jump"),r.treeJumpTimer=null},1400)}var $o='<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14"></path><path d="M19 5L5 19"></path></svg>',Go='<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>';function z(e){var t=_(e),a=e.hasAttribute("data-stadiaref-auto"),o=document.createElement("span");return o.className="stadiaref-tag stadiaref-tag--"+t+(a?" stadiaref-tag--auto":""),o.textContent=a?"AUTO":Qe[t].tag,o}function w(e,t,a){var o=document.createElement(e);return t&&(o.className=t),a!==void 0&&(o.textContent=a),o}var jo=[["all","All"],["section","Sections"],["block","Blocks"],["element","Elements"]];function ce(){return r.treeView||(r.treeView={query:"",tier:"all",tab:"addresses"}),r.treeView}function Ko(){var e={},t=w("div","stadiaref-tree-panel__header"),a=w("div","stadiaref-tree-panel__header-main"),o=w("div","stadiaref-tree-panel__title-wrap");o.appendChild(w("span","stadiaref-tree-panel__title","Address tree")),e.count=w("span","stadiaref-tree-panel__count"),o.appendChild(e.count);var i=w("button","stadiaref-tree-panel__close");i.type="button",i.innerHTML=$o,i.setAttribute("aria-label","Close tree panel"),i.addEventListener("click",function(){H()}),a.appendChild(o),a.appendChild(i),t.appendChild(a),e.meta=w("div","stadiaref-tree-panel__meta"),t.appendChild(e.meta),e.hint=w("div","stadiaref-tree-panel__hint"),t.appendChild(e.hint),e.search=w("input","stadiaref-tree-search"),e.search.type="search",e.search.placeholder="Filter addresses",e.search.setAttribute("aria-label","Filter addresses"),e.search.setAttribute("autocomplete","off"),e.search.setAttribute("spellcheck","false"),e.search.addEventListener("input",function(){ce().query=e.search.value,lt()}),t.appendChild(e.search);var n=w("div","stadiaref-tree-controls"),s=w("div","stadiaref-tree-tabs");s.setAttribute("role","group"),s.setAttribute("aria-label","List"),e.tabs={},[["addresses","Addresses"],["problems","Problems"]].forEach(function(d){var f=w("button","stadiaref-tree-tab",d[1]);f.type="button",f.setAttribute("data-stadiaref-tree-tab",d[0]),f.addEventListener("click",function(){ce().tab=d[0],Zt(),lt()}),e.tabs[d[0]]=f,s.appendChild(f)}),n.appendChild(s);var l=w("div","stadiaref-tree-filters");l.setAttribute("role","group"),l.setAttribute("aria-label","Tier"),e.filters={},jo.forEach(function(d){var f=w("button","stadiaref-tree-filter",d[1]);f.type="button",f.setAttribute("data-stadiaref-tree-filter",d[0]),f.addEventListener("click",function(){ce().tier=d[0],Zt(),lt()}),e.filters[d[0]]=f,l.appendChild(f)}),n.appendChild(l),t.appendChild(n),e.header=t,e.body=w("div","stadiaref-tree-panel__body"),r.treeUi=e,r.treePanel.innerHTML="",r.treePanel.setAttribute("role","dialog"),r.treePanel.setAttribute("aria-label","Address tree"),r.treePanel.appendChild(t),r.treePanel.appendChild(e.body)}function Zt(){var e=r.treeUi,t=ce();for(var a in e.tabs)e.tabs[a].setAttribute("aria-pressed",t.tab===a?"true":"false");for(var o in e.filters)e.filters[o].setAttribute("aria-pressed",t.tier===o?"true":"false");e.filters.all.parentNode.hidden=t.tab!=="addresses",e.tabs.problems.textContent="Problems"+(r.treeProblems&&r.treeProblems.length?" "+r.treeProblems.length:"")}function Yo(){var e=te(document.querySelectorAll("[data-ref]"));return e.sort(function(t,a){return t.compareDocumentPosition(a)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1}),e}function Xo(e){for(var t=0,a=e.parentElement;a;a=a.parentElement)a.hasAttribute("data-ref")&&t++;return t}function st(e,t){var a=e.getAttribute("data-ref"),o=w("div","stadiaref-tree-row"+(t.problem?" stadiaref-tree-row--problem":""));o.tabIndex=0,o.title="Jump to "+a,o.style.paddingLeft=12+(t.depth||0)*18+"px",t.note?o.appendChild(w("span","stadiaref-tree-problem",t.note)):o.appendChild(z(e)),o.appendChild(w("span","stadiaref-tree-ref",t.label||a));var i=w("button","stadiaref-tree-copy");i.type="button",i.innerHTML=Go,i.setAttribute("aria-label","Copy "+a),i.addEventListener("click",function(l){l.stopPropagation(),Q(e,a,i,"tree")}),t.noCopy||o.appendChild(i);function n(){P("hover",e),o.classList.add("stadiaref-tree-row--active")}function s(){L("hover"),o.classList.remove("stadiaref-tree-row--active")}return o.addEventListener("mouseenter",n),o.addEventListener("mouseleave",s),o.addEventListener("focus",n),o.addEventListener("blur",s),o.addEventListener("click",function(){jr(e)}),o.addEventListener("keydown",function(l){l.target===o&&(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),jr(e))}),t.problem||r.treeRows.push({el:e,row:o}),o}function lt(){var e=r.treeUi.body,t=ce();Yr(),e.innerHTML="",r.treeRows=[];var a=r.treeRefs||[];if(t.tab==="problems"){var o=r.treeProblems||[];o.length||e.appendChild(w("div","stadiaref-tree-empty","No problems: no duplicates, nothing unclassified, no gaps in numbering.")),o.forEach(function(s){if(s.kind==="duplicate")s.items.forEach(function(d,f){e.appendChild(st(d.el,{problem:!0,note:"DUP",label:s.address+" ("+(f+1)+" of "+s.count+")"}))});else if(s.kind==="unclassified")e.appendChild(st(s.items[0].el,{problem:!0,note:"?",label:s.address+" (unclassified)"}));else{var l=s.missing.join(", ")+(s.more?" and "+s.more+" more":"")+" missing, before "+s.after.address;e.appendChild(st(s.after.el,{problem:!0,note:"GAP",label:l,noCopy:!0}))}});return}if(a.length===0){e.appendChild(w("div","stadiaref-tree-empty","No addresses on this screen yet."));return}var i=t.query.trim().toLowerCase(),n=0;h(a,function(s){var l=s.getAttribute("data-ref");i&&l.toLowerCase().indexOf(i)===-1||t.tier!=="all"&&_(s)!==t.tier||(n++,e.appendChild(st(s,{depth:i||t.tier!=="all"?0:Xo(s)})))}),n||e.appendChild(w("div","stadiaref-tree-empty","No address matches."))}function pe(){r.treeUi||Ko();var e=Yo(),t=r.treeUi;r.treeRefs=e,r.treeProblems=$r(e.map(function(o){return{address:o.getAttribute("data-ref"),tier:_(o),auto:o.hasAttribute("data-stadiaref-auto"),el:o}}));var a=de[r.outlineMode]||"Off";t.count.textContent=String(e.length),t.count.setAttribute("aria-label",e.length+(e.length===1?" address":" addresses")),t.meta.innerHTML="",t.meta.appendChild(w("span","stadiaref-tree-panel__meta-item","Show "+Me())),t.meta.appendChild(w("span","stadiaref-tree-panel__meta-item","Auto-address "+(r.autoRefEnabled?"on":"off"))),t.meta.appendChild(w("span","stadiaref-tree-panel__meta-item","Outline "+a)),t.hint.textContent=e.length?"Hover a row to find it on the page. Click to jump there.":"Add data-ref attributes, or turn on auto-address.",t.search.value!==ce().query&&(t.search.value=ce().query),Zt(),lt()}function Gr(e){for(var t=0;t<(r.treeRows||[]).length;t++)if(r.treeRows[t].el===e)return r.treeRows[t].row;return null}function jr(e){Vo(e),r.clickMode!=="copy"&&Zr(e)}function Xr(e){r.treeOpen||H();var t=Gr(e);if(!t&&r.treeUi&&(r.treeView={query:"",tier:"all",tab:"addresses"},pe(),t=Gr(e)),!t)return!1;try{t.scrollIntoView({block:"center"})}catch{t.scrollIntoView()}return t.focus({preventScroll:!0}),!0}function H(){r.treeOpen=!r.treeOpen,T(r.treePanel,"stadiaref-tree-panel--open",r.treeOpen),r.treeOpen?pe():(Kr(),Yr());var e=r.toolbar.querySelector("[data-stadiaref-toggle-tree]");e&&e.setAttribute("aria-pressed",r.treeOpen?"true":"false"),Pe(),r.applyDockPosition&&r.applyDockPosition(),y("tree",{open:r.treeOpen,width:r.treeWidth})}function dt(e){if(e!=="overlay"&&e!=="push"){typeof console<"u"&&console.warn&&console.warn('[stadiaref] tree expected "overlay" or "push", got',e);return}if(r.treeMode!==e){r.treeMode=e,T(r.treePanel,"stadiaref-tree-panel--push",e==="push");var t=r.treeWidth;Pe(),r.applyDockPosition&&r.applyDockPosition(),r.treeOpen&&t!==r.treeWidth&&y("tree",{open:!0,width:r.treeWidth})}}function Pe(){var e=r.treeMode==="push";r.treeWidth=e&&r.treeOpen&&r.treePanel?r.treePanel.offsetWidth:0;var t=document.documentElement;e&&r.mounted?t.style.setProperty("--stadiaref-tree-w",r.treeWidth+"px"):t.style.getPropertyValue("--stadiaref-tree-w")&&t.style.removeProperty("--stadiaref-tree-w")}function Jr(){if(!(r.treeMode!=="push"||!r.treeOpen)){var e=r.treeWidth;Pe(),e!==r.treeWidth&&(r.applyDockPosition&&r.applyDockPosition(),y("tree",{open:!0,width:r.treeWidth}))}}var ea=140,er=14,tr=6,Le=8,Jo={section:"section",block:"block",element:"element",unclassified:"unclassified"};function A(e,t,a){var o=document.createElement(e);return t&&(o.className=t),a!==void 0&&(o.textContent=a),o}function or(e){var t="";return(function a(o){for(var i=o.firstChild;i;i=i.nextSibling)if(i.nodeType===3)t+=i.nodeValue+" ";else if(i.nodeType===1){var n=i.getAttribute("class")||"";if(n.indexOf("stadiaref-")!==-1||i.tagName==="SCRIPT"||i.tagName==="STYLE")continue;a(i)}})(e),t=t.replace(/\s+/g," ").trim(),t||(t=(e.getAttribute("aria-label")||e.getAttribute("alt")||e.getAttribute("title")||"").trim()),t.length>ea?t.slice(0,ea-1).trimEnd()+"\u2026":t}function aa(e){for(var t=[],a=e.parentElement;a;a=a.parentElement)a.hasAttribute("data-ref")&&t.unshift(a);return t}function Zo(e){for(var t=[],a=e.querySelectorAll("[data-ref]"),o=0;o<a.length;o++){for(var i=a[o].parentElement;i&&i!==e&&!i.hasAttribute("data-ref");)i=i.parentElement;i===e&&t.push(a[o])}return t}function oa(e){var t=(document.title||"").trim(),a=[t||location.href,window.innerWidth+"px",e.getAttribute("data-ref"),_(e)],o=or(e);return o&&a.push('"'+o.replace(/"/g,"'")+'"'),a.join(" | ")}function ei(e){return{tier:_(e),element:e,text:or(e),chain:aa(e).map(function(t){return t.getAttribute("data-ref")}),tag:e.tagName.toLowerCase(),url:location.href,title:document.title||"",viewport:{width:window.innerWidth,height:window.innerHeight},brief:oa(e)}}function he(e,t,a){if(r.clickMode==="copy")return Q(e,t,a,"label");re(e,a)}function De(){return!!(r.card&&r.card.target)}function ti(){if(r.card)return r.card;var e=A("div","stadiaref-card");return e.setAttribute("role","dialog"),e.tabIndex=-1,e.hidden=!0,e.addEventListener("keydown",ni),r.shadowRoot.appendChild(e),r.card={box:e,target:null,anchor:null,returnFocus:null,seq:0},r.card}function ue(e,t,a){var o=A("button","stadiaref-card__btn"+(t?" stadiaref-card__btn--"+t:""),e);return o.type="button",o.addEventListener("click",function(i){i.stopPropagation(),a(o)}),o}function ta(e,t){var a=A("button","stadiaref-card__ref"+(t?" "+t:""));return a.type="button",a.appendChild(z(e)),a.appendChild(A("span","stadiaref-card__ref-text",e.getAttribute("data-ref"))),a.title="Open "+e.getAttribute("data-ref"),a.addEventListener("click",function(o){o.stopPropagation(),re(e,null,{focus:!0})}),a}function ra(e){var t=A("div","stadiaref-card__section");return t.appendChild(A("div","stadiaref-card__key",e)),t}function ri(e){if(typeof e!="string"||!e)return null;try{var t=new URL(e,location.href);return/^(https?|mailto):$/.test(t.protocol)?t.href:null}catch{return null}}var ai={ok:1,warn:1,error:1,muted:1};function ft(e,t){e.innerHTML="",Array.isArray(t)||(t=[]),t.forEach(function(a){if(!(!a||typeof a!="object")){var o=A("div","stadiaref-card__row"+(ai[a.tone]?" stadiaref-card__row--"+a.tone:""));o.appendChild(A("span","stadiaref-card__row-label",a.label==null?"":String(a.label)));var i=ri(a.href),n=A(i?"a":"span","stadiaref-card__row-value",a.value==null?"":String(a.value));i&&(n.href=i,n.target="_blank",n.rel="noopener noreferrer"),o.appendChild(n),e.appendChild(o)}}),e.hidden=!e.firstChild,r.card&&r.card.target&&ia()}function oi(e,t,a,o){if(e.hidden=!0,typeof r.lookup=="function"){var i;try{i=r.lookup(a,t)}catch(n){rr("setLookup function threw",n);return}i&&typeof i.then=="function"?(ft(e,[{label:"Looking up",value:"\u2026",tone:"muted"}]),i.then(function(n){r.card&&r.card.seq===o&&ft(e,n)},function(n){rr("setLookup promise rejected",n),r.card&&r.card.seq===o&&ft(e,[])})):ft(e,i)}}function rr(e,t){typeof console<"u"&&console.warn&&console.warn("[stadiaref] "+e,t)}function ii(e){var t=r.card,a=t.box,o=e.getAttribute("data-ref"),i=_(e);a.innerHTML="",a.setAttribute("aria-label","Address "+o);var n=A("div","stadiaref-card__head");n.appendChild(z(e)),n.appendChild(A("span","stadiaref-card__tier",Jo[i]+(e.hasAttribute("data-stadiaref-auto")?", automatic":"")));var s=ue("","close",function(){M()});s.setAttribute("aria-label","Close"),s.innerHTML='<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14"></path><path d="M19 5L5 19"></path></svg>',n.appendChild(s),a.appendChild(n),a.appendChild(A("div","stadiaref-card__address",o));var l=or(e);l&&a.appendChild(A("div","stadiaref-card__text",l));var d=A("div","stadiaref-card__rows");a.appendChild(d),oi(d,e,o,t.seq);var f=aa(e);if(f.length){var c=ra("Inside"),g=A("div","stadiaref-card__refs");f.forEach(function(F){g.appendChild(ta(F))}),c.appendChild(g),a.appendChild(c)}var u=Zo(e);if(u.length){var m=ra("Contains "+u.length),v=A("div","stadiaref-card__refs");u.slice(0,er).forEach(function(F){v.appendChild(ta(F))}),u.length>er&&v.appendChild(A("span","stadiaref-card__more","+"+(u.length-er)+" more")),m.appendChild(v),a.appendChild(m)}var x=A("div","stadiaref-card__actions");x.appendChild(ue("Copy","copy",function(F){Q(e,o,F,"card")})),x.appendChild(ue("Copy for a brief","",function(F){Xt(oa(e)).then(function(Z){$("click",e,o,F,{source:"brief",copied:Z})})}));var N=ue("Parent","",function(){f.length&&re(f[f.length-1],null,{focus:!0})});f.length||(N.disabled=!0),x.appendChild(N),x.appendChild(ue("Show in Tree","",function(){r.showInTree&&r.showInTree(e)})),r.drillEnabled&&r.drillInto&&x.appendChild(ue("Drill in","",function(){r.drillInto(e)})),r.onAddress&&typeof r.onAddress.fn=="function"&&x.appendChild(ue(r.onAddress.label,"host",function(){try{r.onAddress.fn(o,ei(e))}catch(F){rr("onAddress function threw",F)}})),a.appendChild(x)}function ia(){var e=r.card;if(!(!e||!e.target||e.box.hidden)){var t=e.anchor&&e.anchor.isConnected&&e.anchor.getClientRects().length?e.anchor:e.target,a=t.getBoundingClientRect(),o=e.box.offsetWidth,i=e.box.offsetHeight,n=window.innerWidth,s=window.innerHeight,l=a.bottom+tr,d=!1;l+i>s-Le&&a.top-tr-i>=Le&&(l=a.top-tr-i,d=!0),l=Math.max(Le,Math.min(l,s-i-Le));var f=Math.max(Le,Math.min(a.left,n-o-Le));e.box.style.top=Math.round(l)+"px",e.box.style.left=Math.round(f)+"px",e.box.setAttribute("data-placement",d?"above":"below")}}function re(e,t,a){if(!e||!e.getAttribute||!e.getAttribute("data-ref")||!r.shadowRoot)return!1;var o=ti(),i=o.target;if(i&&i!==e&&ar(!1,i),!i){var n=document.activeElement;o.returnFocus=n&&n!==document.body?n:null}if(o.seq++,o.target=e,o.anchor=t||null,r.dismissChain&&r.dismissChain(),ii(e),o.box.hidden=!1,ia(),P("card",e),a&&a.focus){var s=o.box.querySelector(".stadiaref-card__btn--copy");(s||o.box).focus({preventScroll:!0})}else o.box.focus({preventScroll:!0});return i!==e&&ar(!0,e),!0}function Zr(e){var t=null,a=0,o=Date.now();(function i(){if(e.isConnected){var n=e.getBoundingClientRect().top;a=t!==null&&Math.abs(n-t)<.5?a+1:0,t=n,a>=3||Date.now()-o>1e3?re(e,null):requestAnimationFrame(i)}})()}function M(){var e=r.card;if(!e||!e.target)return!1;var t=e.target;e.target=null,e.anchor=null,e.seq++,e.box.hidden=!0,L("card");var a=e.returnFocus;if(e.returnFocus=null,a&&a.isConnected&&a.focus)try{a.focus({preventScroll:!0})}catch{}return ar(!1,t),!0}function ar(e,t){y("card",{open:e,address:t.getAttribute("data-ref"),tier:_(t),element:t})}function ni(e){if(e.key==="Tab"){var t=Array.prototype.filter.call(r.card.box.querySelectorAll("button, a[href]"),function(n){return!n.disabled});if(t.length){var a=r.shadowRoot.activeElement,o=t.indexOf(a),i=e.shiftKey?o<=0?t.length-1:o-1:o===-1||o===t.length-1?0:o+1;e.preventDefault(),t[i].focus({preventScroll:!0})}}}function si(e){var t=typeof e.composedPath=="function"?e.composedPath():[e.target];return t.indexOf(r.card.box)!==-1}function na(){window.addEventListener("pointerdown",function(e){De()&&!si(e)&&M()},!0),window.addEventListener("scroll",function(e){!De()||r.card.box.contains&&e.target&&r.card.box.contains(e.target)||M()},!0),window.addEventListener("resize",function(){De()&&M()})}function ir(){if(r.layer)return r.layer;var e=document.createElement("div");e.className="stadiaref-layer";var t=r.shadowRoot.firstChild;return r.shadowRoot.insertBefore(e,t?t.nextSibling:null),r.layer=e,r.slotted=new Set,typeof window.ResizeObserver=="function"&&(r.slotObserver=new window.ResizeObserver(ge)),window.addEventListener("scroll",ge,{capture:!0,passive:!0}),window.addEventListener("resize",ge),e}function be(e){ir();var t=p(e);if(t.slot&&t.slot.parentNode===r.layer)return t.slot;var a=document.createElement("div");a.className="stadiaref-slot";var o=e.getAttribute("data-ref");return o&&a.setAttribute("data-stadiaref-for",o),r.layer.appendChild(a),t.slot=a,r.slotted.add(e),r.slotObserver&&r.slotObserver.observe(e),ge(),a}function pt(e,t){if(O(e)){var a=p(e),o=a.slot;o&&(!t&&o.firstChild||(o.parentNode&&o.parentNode.removeChild(o),a.slot=null,r.slotted&&r.slotted.delete(e),r.slotObserver&&r.slotObserver.unobserve(e)))}}function la(e){var t=O(e)&&p(e).slot;if(t){var a=e.getAttribute("data-ref");a&&t.getAttribute("data-stadiaref-for")!==a&&t.setAttribute("data-stadiaref-for",a)}}var sa={hidden:1,scroll:1,auto:1,clip:1};function li(e){var t=p(e);if(t.clipVersion===r.clipVersion)return t.clippers;for(var a=[],o=document.documentElement,i=e;i&&i!==o&&i!==document.body;i=i.parentElement){var n=window.getComputedStyle(i);if(i!==e&&(sa[n.overflowX]||sa[n.overflowY])&&a.push(i),n.position==="fixed")break}return t.clippers=a,t.clipVersion=r.clipVersion,a}function da(){r.clipVersion=(r.clipVersion||0)+1}function di(e,t){var a=t.get(e);if(a)return a;var o=e.getBoundingClientRect(),i=o.left+e.clientLeft,n=o.top+e.clientTop;return a={left:i,top:n,right:i+e.clientWidth,bottom:n+e.clientHeight},t.set(e,a),a}function fi(e,t){var a=li(e);if(!a.length)return null;for(var o={left:-1/0,top:-1/0,right:1/0,bottom:1/0},i=0;i<a.length;i++){var n=di(a[i],t);o.left=Math.max(o.left,n.left),o.top=Math.max(o.top,n.top),o.right=Math.min(o.right,n.right),o.bottom=Math.min(o.bottom,n.bottom)}return o}function ct(e){return Math.round(e*100)/100+"px"}function ci(e,t,a,o,i){var n=Math.round((a.left-o.left)*100)/100,s=Math.round((a.top-o.top)*100)/100;t.style.transform="translate("+n+"px, "+s+"px)",t.style.width=a.width+"px",t.style.height=a.height+"px";var l="";if(i){l="inset("+ct(i.top-a.top)+" "+ct(a.right-i.right)+" "+ct(a.bottom-i.bottom)+" "+ct(i.left-a.left)+")";var d=i.right<=i.left||i.bottom<=i.top||i.right<=a.left||i.left>=a.right||i.bottom<=a.top||i.top>=a.bottom;d!==t.hasAttribute("data-clipped")&&t.toggleAttribute("data-clipped",d)}else t.hasAttribute("data-clipped")&&t.removeAttribute("data-clipped");t.style.clipPath!==l&&(t.style.clipPath=l)}function ve(){if(!(!r.layer||!r.slotted)){var e=[];r.slotted.forEach(function(s){if(!s.isConnected){var l=p(s),d=l.slot;d&&d.parentNode&&d.parentNode.removeChild(d),l.slot=null,r.slotted.delete(s),r.slotObserver&&r.slotObserver.unobserve(s);return}e.push(s)});for(var t=r.layer.getBoundingClientRect(),a=new Map,o=e.map(function(s){return s.getBoundingClientRect()}),i=e.map(function(s){return fi(s,a)}),n=0;n<e.length;n++)ci(e[n],p(e[n]).slot,o[n],t,i[n]);ui()}}function ge(){r.placeScheduled||!r.layer||(r.placeScheduled=!0,(window.requestAnimationFrame||function(e){return setTimeout(e,16)})(function(){r.placeScheduled=!1,ve(),r.highlights&&r.placeHighlights&&r.placeHighlights()}))}function fa(e){var t=O(e)&&p(e).slot;return!!(t&&t.hasAttribute("data-clipped"))}var pi=150;function ui(){r.layer&&(clearTimeout(r.coverTimer),r.coverTimer=setTimeout(bi,pi))}function hi(e,t){for(var a=e;a&&a.nodeType===1&&a!==document.body&&a!==document.documentElement;a=a.parentElement){if(a.contains(t))return!1;var o=window.getComputedStyle(a).position;if(o==="fixed"||o==="sticky")return!0}return!1}function gi(e){return e===r.shadowHost||e===r.mountHost}function bi(){if(r.coverTimer=null,!(!r.layer||!r.slotted||typeof document.elementsFromPoint!="function")){var e=window.innerWidth,t=window.innerHeight;r.slotted.forEach(function(a){var o=p(a).slot;if(!(!o||!a.isConnected)){var i=!1;if(!o.hasAttribute("data-clipped")){var n=a.getBoundingClientRect(),s=Math.min(n.left+4,n.right-1),l=Math.min(n.top+4,n.bottom-1);if(s>=0&&l>=0&&s<e&&l<t&&n.width>0&&n.height>0){for(var d=document.elementsFromPoint(s,l),f=null,c=0;c<d.length;c++)if(!gi(d[c])){f=d[c];break}i=!!f&&f!==a&&!a.contains(f)&&hi(f,a)}}i!==o.hasAttribute("data-covered")&&o.toggleAttribute("data-covered",i)}})}}function ae(e){return r.layer?r.layer.querySelectorAll(e):[]}function ca(e,t){r.layer&&(t===null?r.layer.hasAttribute(e)&&r.layer.removeAttribute(e):r.layer.getAttribute(e)!==t&&r.layer.setAttribute(e,t))}import{MAX_LENGTH as cn}from"./core.mjs";function me(e){for(var t=e;t&&t!==document.documentElement;){var a=window.getComputedStyle(t).backgroundColor;if(a&&a!=="rgba(0, 0, 0, 0)"&&a!=="transparent"){var o=a.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(o){var i=parseInt(o[1])/255,n=parseInt(o[2])/255,s=parseInt(o[3])/255;return .2126*i+.7152*n+.0722*s}}t=t.parentElement}return 1}function nr(e){for(var t=e;t&&t.nodeType===1&&t!==document.documentElement;){var a;try{a=window.getComputedStyle(t)}catch{return!0}if(!a)return!0;if(a.display==="none"||a.visibility==="hidden"||a.visibility==="collapse")return!1;var o=parseFloat(a.opacity);if(o===0||o<1&&vi(a))return!1;t=t.parentElement}return!0}function vi(e){if(!e)return!1;for(var t=(e.transitionProperty||"").split(","),a=(e.transitionDuration||"").split(","),o=0;o<t.length;o++){var i=(t[o]||"").replace(/\s+/g,""),n=a[o]!=null?a[o]:a[0]||"0s",s=parseFloat(n);if(s>0&&(i==="opacity"||i==="visibility"||i==="all"))return!0}return!1}function He(){if(!b())return!1;var e=document.querySelectorAll("[data-ref]"),t=!1;return h(e,function(a){if(oe(a)){var o=nr(a);if(p(a).visible!==o){p(a).visible=o,t=!0;for(var i=[p(a).icon,p(a).tooltip,p(a).fullLabel,p(a).link],n=0;n<i.length;n++){var s=i[n];s&&(o?(s.classList.remove("stadiaref-ref-hidden"),(s===p(a).icon||s===p(a).fullLabel)&&s.classList.add("stadiaref-visible-host")):(s.classList.add("stadiaref-ref-hidden"),s.classList.remove("stadiaref-visible-host")))}}}}),t}function sr(e){if(!(!b()||!e||e.nodeType!==1)){var t=[];if(e.hasAttribute&&e.hasAttribute("data-ref")&&oe(e)&&t.push(e),e.querySelectorAll)for(var a=e.querySelectorAll("[data-ref]"),o=0;o<a.length;o++)oe(a[o])&&t.push(a[o]);for(var i=0;i<t.length;i++){for(var n=t[i],s=[p(n).icon,p(n).tooltip,p(n).fullLabel,p(n).link],l=0;l<s.length;l++){var d=s[l];d&&(d.classList.add("stadiaref-ref-hidden"),d.classList.remove("stadiaref-visible-host"))}p(n).visible=null}}}function ut(){if(!r.visibilityRecheckScheduled){r.visibilityRecheckScheduled=!0;var e=window.requestAnimationFrame||function(t){return setTimeout(t,16)};e(function(){r.visibilityRecheckScheduled=!1,He()&&C()})}}function mi(){var e=[];h(ae(".stadiaref-outline"),function(a){p(a).owner&&e.push(p(a).owner),fe(a)});for(var t=0;t<e.length;t++)pt(e[t])}function pa(e,t){var a=document.createElement("span");a.className="stadiaref-outline stadiaref-outline--"+t+(me(e)<.4?" stadiaref-on-dark":""),p(a).owner=e,be(e).appendChild(a)}function Ne(){if(b()&&(mi(),r.outlineMode!=="off")){var e=ht("section"),t=[],a;h(e,function(o){pa(o,"section"),t.push(o)}),r.outlineMode==="block"&&(a=ht("block"),h(a,function(o){ot(t,o)||pa(o,"block")}))}}function I(e){r.outlineMode=de[e]?e:"off",Ne(),gt("outline","data-stadiaref-outline",r.outlineMode,de[r.outlineMode]),y("outline-change",{outline:r.outlineMode})}var ze={icons:0,off:1,full:2},lr={0:"icons",1:"off",2:"full"};function xe(e){dr(e),y("labels-change",{labels:qe()})}function dr(e){r.state=e,gt("mode","data-stadiaref-state",r.state,tt[r.state]),b()&&(D(),C())}function Ie(e){if(!Object.prototype.hasOwnProperty.call(ze,e)){typeof console<"u"&&console.warn&&console.warn('[stadiaref] setLabels expected "full" | "icons" | "off", got',e);return}xe(ze[e])}function qe(){return lr[r.state]||"full"}function bt(){for(var e=document.querySelectorAll("dialog"),t=0;t<e.length;t++)try{if(e[t].matches(":modal"))return e[t]}catch{}for(var a=document.querySelectorAll('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]'),o=0;o<a.length;o++)if(!a[o].closest("#stadiaref-host")&&a[o].getClientRects().length>0&&getComputedStyle(a[o]).visibility!=="hidden")return a[o];return null}function xi(){var e;try{e=document.querySelectorAll(":popover-open")}catch{return null}for(var t=e.length-1;t>=0;t--)if(!e[t].closest("#stadiaref-host"))return e[t];return null}function ha(){return!!bt()}var ua="stadiaref-ref-outside";function yi(e){var t=p(e);return[t.icon,t.tooltip,t.fullLabel,t.link,t.clusterBadge,t.groupBadge]}function wi(e){h(document.querySelectorAll("[data-ref]"),function(t){if(O(t))for(var a=!!e&&t!==e&&!e.contains(t),o=yi(t),i=0;i<o.length;i++){var n=o[i];!n||!n.classList||n.classList.contains(ua)!==a&&n.classList.toggle(ua,a)}})}function fr(e){if(!(!r.shadowHost||r.shadowHost.parentNode===e))try{e.appendChild(r.shadowHost)}catch{}}function ki(){if(r.dialogStatus)return r.dialogStatus;var e=document.createElement("div");return e.className="stadiaref-dialog-status",e.setAttribute("role","status"),e.hidden=!0,r.shadowRoot.appendChild(e),r.dialogStatus=e,e}function _i(e){return e.querySelectorAll("[data-ref]").length+(e.hasAttribute("data-ref")?1:0)}function ye(){if(r.mounted){var e=r.presentationMode?null:bt(),t=ki();if(e){var a=_i(e),o="Dialog opened. Showing the "+a+" address"+(a===1?"":"es")+" inside it.";t.textContent!==o&&(t.textContent=o),t.hidden=!1;var i=r.scopeModal!==e;i&&(r.scopeModal=e),fr(e),i&&r.position==="host"&&r.applyDockPosition&&r.applyDockPosition()}else{t.hidden=!0,r.scopeModal&&(r.scopeModal=null,r.position==="host"&&r.applyDockPosition&&r.applyDockPosition());var n=r.presentationMode?null:xi();n?fr(n):document.body&&fr(document.body)}wi(e)}}var Li=["data-ref","class","style","hidden","open","role","aria-modal","data-stadiaref-visible","data-stadiaref-labels","data-stadiaref-hidden-tiers","data-stadiaref-mode"];function vt(e){if(!e)return!1;if(e===r.shadowHost)return!0;if(e.nodeType!==1)return!1;var t=e.getAttribute("class");return!!(t&&/(^|\s)stadiaref-/.test(t))}function Ai(e){return(window.requestAnimationFrame||function(t){return setTimeout(t,16)})(e)}function mt(e){var t=r.pendingWork||(r.pendingWork={});for(var a in e)e[a]&&(t[a]=!0);r.workScheduled||(r.workScheduled=!0,Ai(function(){r.workScheduled=!1;var o=r.pendingWork;if(r.pendingWork=null,!(!o||!r.mounted)&&(o.heal&&Ci(),!!b())){if(o.root&&D(),o.survey){ie();return}o.visibility?ut():o.layout&&C(),ye(),cr()}}))}function Ei(e){if(r.mounted){for(var t={},a=0;a<e.length;a++){var o=e[a];if(o.type==="childList"){if(vt(o.target))continue;for(var i=0;i<o.addedNodes.length;i++){var n=o.addedNodes[i];vt(n)||(n.nodeType===1||n.nodeType===3)&&(t.survey=!0)}for(var s=0;s<o.removedNodes.length;s++){var l=o.removedNodes[s];if(l===r.shadowHost){l.isConnected||(t.heal=!0);continue}if(l===r.mountHost){t.survey=!0;continue}vt(l)||(t.survey=!0,l.nodeType===1&&r.shadowHost&&l.contains(r.shadowHost)&&(t.heal=!0))}}else if(o.type==="attributes"){var d=o.target,f=o.attributeName;if(d===document.documentElement&&f.indexOf("data-stadiaref-")===0){t.root=!0;continue}if(vt(d))continue;f==="data-ref"?t.survey=!0:f==="class"?(t.visibility=!0,r.classConverterEnabled&&(t.survey=!0),d!==document.documentElement&&sr(d)):f==="style"||f==="hidden"||f==="open"?(t.visibility=!0,t.layout=!0,sr(d)):(f==="role"||f==="aria-modal")&&(t.layout=!0)}}r.shadowHost&&!r.shadowHost.isConnected&&(t.heal=!0),r.watch||(t.survey=!1),(t.heal||t.survey||t.visibility||t.root||t.layout)&&mt(t)}}function ga(){if(!(r.observer||typeof window.MutationObserver!="function")&&(r.observer=new window.MutationObserver(Ei),r.observer.observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0,attributeFilter:Li}),!r.navListening)){r.navListening=!0;var e=function(){r.watch&&r.mounted&&mt({survey:!0})};window.addEventListener("popstate",e),window.addEventListener("hashchange",e);var t=function(){r.mounted&&mt({heal:!0,survey:!0})};document.addEventListener("astro:after-swap",t),document.addEventListener("astro:page-load",t)}}function cr(){r.observer&&(r.observer.takeRecords(),document.body&&!r.shadowHost.isConnected&&mt({heal:!0}))}function Ci(){if(r.mounted){var e=!1;!r.shadowHost.isConnected&&document.body&&(document.body.appendChild(r.shadowHost),r.scopeModal=null,e=!0),e&&b()&&(D(),ie())}}function ba(){if(!(typeof performance>"u"||!performance.mark))try{performance.getEntriesByName("stadiaref:survey").length>200&&performance.clearMarks("stadiaref:survey"),performance.mark("stadiaref:survey")}catch{}}function Si(){if(r.findPanel)return r.findPanel;var e=document.createElement("div");e.className="stadiaref-find",e.setAttribute("role","dialog"),e.setAttribute("aria-label","Find an address"),e.innerHTML='<label class="stadiaref-find__label">Find an address<input class="stadiaref-find__input" type="search" autocomplete="off" spellcheck="false" aria-controls="stadiaref-find-list"></label><div class="stadiaref-find__list" id="stadiaref-find-list" role="listbox" aria-label="Matches"></div><div class="stadiaref-find__status" role="status" aria-live="polite"></div>',r.shadowRoot.appendChild(e),r.findPanel=e;var t=e.querySelector("input");return t.addEventListener("input",function(){ma(t.value)}),t.addEventListener("keydown",Ri),e}function Fi(){var e=bt();return e||document}function Ti(e){var t=String(e||"").trim().toLowerCase();if(!t)return[];var a=Fi(),o=Array.prototype.slice.call(a.querySelectorAll("[data-ref]"));return a!==document&&a.hasAttribute("data-ref")&&o.unshift(a),o.filter(function(i){return i.getAttribute("data-ref").toLowerCase().indexOf(t)!==-1})}function ma(e){var t=r.findState;t.query=e;var a=String(e||"").trim().toLowerCase(),o=Ti(a),i=o.map(function(d){return{el:d,nested:!1}}),n=o.filter(function(d){return d.getAttribute("data-ref").toLowerCase()===a}),s=0;if(n.length===1){var l=Array.prototype.slice.call(n[0].querySelectorAll("[data-ref]"));i=[{el:n[0],nested:!1}],l.forEach(function(d){i.push({el:d,nested:!0})}),s=l.length}return t.matches=o,t.rows=i.map(function(d){return d.hidden=!nr(d.el),d}),t.active=Oi(),Bi(n.length===1?1:o.length,s,a),o.map(function(d){return d.getAttribute("data-ref")})}function Oi(){for(var e=r.findState.rows,t=0;t<e.length;t++)if(!e[t].hidden)return t;return-1}function Bi(e,t,a){var o=r.findState,i=r.findPanel.querySelector(".stadiaref-find__list"),n=r.findPanel.querySelector(".stadiaref-find__status");i.innerHTML="",o.rows.forEach(function(s,l){var d=document.createElement("button");d.type="button",d.className="stadiaref-find__row",d.setAttribute("role","option"),d.setAttribute("aria-selected",l===o.active?"true":"false"),d.tabIndex=-1,s.nested&&(d.style.paddingLeft="26px"),d.appendChild(z(s.el));var f=document.createElement("span");if(f.className="stadiaref-find__address",f.textContent=s.el.getAttribute("data-ref"),d.appendChild(f),s.hidden){var c=document.createElement("span");c.className="stadiaref-find__note",c.textContent="hidden",d.appendChild(c),d.setAttribute("aria-disabled","true"),d.title="Inside something that is closed. Open it to jump there."}d.addEventListener("click",function(){s.hidden||(o.active=l,pr(s.el),Q(s.el,s.el.getAttribute("data-ref"),d,"find"),xa())}),i.appendChild(d)}),a?e?t?n.textContent="1 match, plus the "+t+" address"+(t===1?"":"es")+" inside it. Enter jumps to the first.":n.textContent=e+(e===1?" match.":" matches.")+" Enter jumps to the first.":n.textContent="No address contains \u201C"+a+"\u201D.":n.textContent="Type or paste an address."}function xa(){var e=r.findPanel.querySelector(".stadiaref-find__list");Array.prototype.forEach.call(e.children,function(t,a){t.setAttribute("aria-selected",a===r.findState.active?"true":"false"),a===r.findState.active&&t.scrollIntoView&&t.scrollIntoView({block:"nearest"})})}function va(e){var t=r.findState;if(t.rows.length){for(var a=t.active,o=0;o<t.rows.length&&(a=(a+e+t.rows.length)%t.rows.length,!!t.rows[a].hidden);o++);t.active=a,xa()}}function Ri(e){if(e.key==="ArrowDown")e.preventDefault(),va(1);else if(e.key==="ArrowUp")e.preventDefault(),va(-1);else if(e.key==="Enter"){e.preventDefault();var t=r.findState.rows[r.findState.active];t&&!t.hidden&&pr(t.el)}else e.key==="Escape"&&(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation&&e.stopImmediatePropagation(),j())}function pr(e){try{e.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"})}catch{e.scrollIntoView()}P("find",e);var t=Date.now();(function a(){G(),Date.now()-t<700&&requestAnimationFrame(a)})()}function we(){return!!(r.findState&&r.findState.open)}function Ae(e,t){r.stopPick&&r.stopPick(),r.presentationMode&&r.showToolbar&&r.showToolbar(),r.findState||(r.findState={open:!1,query:"",rows:[],matches:[],active:-1});var a=Si();r.treeOpen&&r.toggleTree&&r.toggleTree(),r.findState.open=!0,a.classList.add("stadiaref-find--open"),ya(!0),B();var o=a.querySelector("input");typeof e=="string"&&(o.value=e);var i=ma(o.value);if(t!==!1)try{o.focus({preventScroll:!0})}catch{o.focus()}var n=r.findState.rows;return typeof e=="string"&&n.length&&n[0].el.getAttribute("data-ref")===e.trim().toLowerCase()&&!n[0].hidden&&pr(n[0].el),i}function j(){if(we()){r.findState.open=!1,r.findPanel.classList.remove("stadiaref-find--open"),L("find"),ya(!1);var e=r.findPanel.querySelector("input");r.shadowRoot.activeElement===e&&e.blur()}}function ya(e){var t=r.toolbar&&r.toolbar.querySelector("[data-stadiaref-find]");t&&t.setAttribute("aria-pressed",e?"true":"false")}var Qi={section:"section",block:"block",element:"element",unclassified:"address"};function Pi(e){for(var t=[],a=e;a&&a.nodeType===1;a=a.parentElement)a.hasAttribute("data-ref")&&t.unshift(a);return t}function Mi(e){return V(e)}function xt(e){var t=typeof e.composedPath=="function"?e.composedPath():[e.target];if(t.indexOf(r.shadowHost)!==-1||r.mountHost&&t.indexOf(r.mountHost)!==-1)return null;var a=t[0];return a&&a.nodeType===1?a:a&&a.parentElement||null}function Di(e,t){if(!t)return e;for(var a=e.split("-"),o=t.split("-"),i=0;i<a.length-1&&i<o.length&&a[i]===o[i];)i++;return i?a.slice(i).join("-"):e}function hr(e){!e||!e.pointerType||(r.lastPointerType=e.pointerType,(e.pointerType==="mouse"||e.pointerType==="pen")&&(r.finePointerSeen=!0))}function yt(){if(r.lastPointerType==="touch")return!0;if(r.lastPointerType==="mouse"||r.lastPointerType==="pen")return!1;var e=!1;try{e=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches}catch{}return e&&!r.finePointerSeen}function Hi(){if(r.pickChip)return r.pickChip;var e=document.createElement("div");return e.className="stadiaref-pick-chip",e.setAttribute("role","status"),e.setAttribute("aria-live","polite"),e.hidden=!0,r.shadowRoot.appendChild(e),r.pickChip=e,e}function wa(){var e=r.pickState,t=document.createElement("div");t.className="stadiaref-pick-chip__parts";for(var a=null,o=0;o<e.chain.length;o++){if(o){var i=document.createElement("span");i.className="stadiaref-pick-chip__sep",i.setAttribute("aria-hidden","true"),i.textContent="/",t.appendChild(i)}var n=e.chain[o].getAttribute("data-ref"),s=document.createElement("span");s.className="stadiaref-pick-chip__part stadiaref-pick-chip__part--"+_(e.chain[o])+(o===e.level?" stadiaref-pick-chip__part--current":""),s.textContent=Di(n,a),t.appendChild(s),a=n}return t}function gr(){var e=Hi(),t=r.pickState;if(t.touch){e.hidden=!0;return}e.innerHTML="";var a,o=document.createElement("div");if(o.className="stadiaref-pick-chip__hint",!t.chain.length)a=document.createElement("div"),a.className="stadiaref-pick-chip__parts",a.textContent="No address here",o.textContent="Point at something with an address. Esc leaves pick mode.";else{a=wa();var i=t.chain[t.level],n=[];t.level>0&&n.push("up arrow selects the "+Qi[_(t.chain[t.level-1])]),t.level<t.chain.length-1&&n.push("down arrow goes back"),n.push("Esc leaves pick mode");var s=n.join(", ");o.textContent=(r.clickMode==="copy"?"Click copies ":"Click opens ")+i.getAttribute("data-ref")+". "+s.charAt(0).toUpperCase()+s.slice(1)+"."}e.appendChild(a),e.appendChild(o),e.hidden=!1,zi()}function ur(e,t,a){var o=document.createElement("button");return o.type="button",o.className="stadiaref-pick-sheet__btn"+(e?" stadiaref-pick-sheet__btn--"+e:""),o.textContent=t,o.addEventListener("click",function(i){i.stopPropagation(),a(o)}),o}function Ni(){if(r.pickSheet)return r.pickSheet;var e=document.createElement("div");return e.className="stadiaref-pick-sheet",e.setAttribute("role","dialog"),e.setAttribute("aria-label","Picked address"),e.hidden=!0,r.shadowRoot.appendChild(e),r.pickSheet=e,e}function br(){var e=r.pickState,t=Ni(),a=e.chain[e.level];if(!a){t.hidden=!0;return}t.innerHTML="",t.appendChild(wa());var o=document.createElement("div");o.className="stadiaref-pick-sheet__address",o.textContent=a.getAttribute("data-ref"),t.appendChild(o);var i=document.createElement("div");i.className="stadiaref-pick-sheet__actions",i.appendChild(ur("copy","Copy address",function(s){var l=r.pickState.chain[r.pickState.level];l&&Q(l,l.getAttribute("data-ref"),s,"pick")}));var n=ur("","Parent",function(){r.pickState.level>0&&(r.pickState.level--,br(),vr())});e.level<=0&&(n.disabled=!0),i.appendChild(n),i.appendChild(ur("","Close",ka)),t.appendChild(i),t.hidden=!1}function ka(){r.pickSheet&&(r.pickSheet.hidden=!0);for(var e=0;e<6;e++)L("pick-"+e);L("pick-current")}function zi(){var e=r.pickChip,t=r.pickState;if(!(!e||e.hidden)){var a=e.offsetWidth,o=e.offsetHeight,i=Math.min(t.x+14,window.innerWidth-a-8),n=t.y+22;n+o>window.innerHeight-8&&(n=t.y-o-14),e.style.left=Math.max(8,i)+"px",e.style.top=Math.max(8,n)+"px"}}function vr(){for(var e=r.pickState,t=0;t<6;t++)L("pick-"+t);L("pick-current");for(var a=0;a<e.chain.length&&a<6;a++)a===e.level?P("pick-current",e.chain[a]):P("pick-"+a,e.chain[a])}function _a(e){var t=r.pickState,a=e?Pi(e):[],o=a.length===t.chain.length&&a.every(function(i,n){return i===t.chain[n]});o||(t.chain=a,t.level=a.length-1),gr(),vr()}function Ii(e){var t=r.pickState;if(e.pointerType!=="touch"){t.touch&&(t.touch=!1,ka()),t.x=e.clientX,t.y=e.clientY;var a=xt(e);a&&_a(a)}}function Ee(e){Mi(e.target)&&xt(e)===null||(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation&&e.stopImmediatePropagation())}function qi(e){if(xt(e)!==null){Ee(e),r.pickState.touch=yt(),_a(xt(e));var t=r.pickState.chain[r.pickState.level];if(r.clickMode!=="copy"){t&&re(t,null,{focus:r.pickState.touch||e.detail===0});return}if(r.pickState.touch){br();return}t&&Q(t,t.getAttribute("data-ref"),r.pickChip,"pick")}}function La(e){var t=r.pickState;if(!(e.ctrlKey||e.metaKey||e.altKey)){if(e.key==="ArrowUp"&&t.level>0)t.level--;else if(e.key==="ArrowDown"&&t.level<t.chain.length-1)t.level++;else return;e.preventDefault(),e.stopPropagation(),gr(),t.touch&&r.pickSheet&&!r.pickSheet.hidden&&br(),vr()}}var Ce=[["pointermove",Ii],["pointerdown",Ee],["mousedown",Ee],["mouseup",Ee],["pointerup",Ee],["auxclick",Ee],["click",qi]];function ke(){return!!(r.pickState&&r.pickState.active)}function mr(){if(!ke()){r.closeFind&&r.closeFind(),r.presentationMode&&r.showToolbar&&r.showToolbar(),r.pickState={active:!0,touch:yt(),chain:[],level:-1,x:window.innerWidth/2,y:window.innerHeight/2},r.pickMode=!0,D();for(var e=0;e<Ce.length;e++)window.addEventListener(Ce[e][0],Ce[e][1],!0);window.addEventListener("keydown",La,!0),Aa(!0),gr()}}function Se(){if(ke()){r.pickState.active=!1,r.pickMode=!1;for(var e=0;e<Ce.length;e++)window.removeEventListener(Ce[e][0],Ce[e][1],!0);window.removeEventListener("keydown",La,!0);for(var t=0;t<6;t++)L("pick-"+t);L("pick-current"),r.pickChip&&(r.pickChip.hidden=!0),r.pickSheet&&(r.pickSheet.hidden=!0),Aa(!1),D()}}function wt(){ke()?Se():mr()}function Aa(e){var t=r.toolbar&&r.toolbar.querySelector("[data-stadiaref-pick]");t&&t.setAttribute("aria-pressed",e?"true":"false")}var Ui=400;function Wi(e){for(var t=e;t&&t.nodeType===1;t=t.parentElement)if(t.hasAttribute("data-ref"))return t;return null}function Vi(e){return r.hintEnabled&&b()&&r.state===1&&!r.pickMode&&!(r.findState&&r.findState.open)&&!(r.card&&r.card.target)&&e.pointerType!=="touch"&&!yt()}function $i(){if(r.hint)return r.hint;var e=document.createElement("div");return e.className="stadiaref-hint",e.setAttribute("role","tooltip"),e.hidden=!0,r.shadowRoot.appendChild(e),r.hint=e,e}function K(){clearTimeout(r.hintTimer),r.hintTimer=null,r.hintTarget=null,r.hint&&(r.hint.hidden=!0)}function Ea(e,t){var a=r.hint;if(!(!a||a.hidden)){var o=a.offsetWidth,i=a.offsetHeight,n=Math.min(e+14,window.innerWidth-o-8),s=t+18;s+i>window.innerHeight-8&&(s=t-i-10),a.style.left=Math.max(8,n)+"px",a.style.top=Math.max(8,s)+"px"}}function Gi(e){var t=$i();t.innerHTML="",t.appendChild(z(e));var a=document.createElement("span");a.className="stadiaref-hint__address",a.textContent=e.getAttribute("data-ref"),t.appendChild(a);var o=document.createElement("span");o.className="stadiaref-hint__tier",o.textContent=_(e),t.appendChild(o),t.hidden=!1,Ea(r.hintX,r.hintY)}function ji(e){if(!Vi(e)){(r.hintTarget||r.hint&&!r.hint.hidden)&&K();return}var t=typeof e.composedPath=="function"?e.composedPath():[e.target],a=t[0];if(V(a)||r.shadowHost&&t.indexOf(r.shadowHost)!==-1){K();return}var o=Wi(a&&a.nodeType===1?a:a&&a.parentElement);if(r.hintX=e.clientX,r.hintY=e.clientY,o===r.hintTarget){Ea(e.clientX,e.clientY);return}K(),o&&(r.hintTarget=o,r.hintTimer=setTimeout(function(){r.hintTarget===o&&o.isConnected&&r.state===1&&b()&&Gi(o)},Ui))}function Ca(){window.addEventListener("pointermove",ji,{capture:!0,passive:!0}),window.addEventListener("pointerdown",K,!0),window.addEventListener("scroll",function(){r.hintTarget&&K()},!0),window.addEventListener("keydown",function(){r.hintTarget&&K()},!0),document.addEventListener("pointerleave",K)}var Sa="stadiaref-ref-outside-drill";function Ki(e){var t=p(e);return[t.icon,t.tooltip,t.fullLabel,t.link,t.clusterBadge,t.groupBadge]}function kt(){var e=r.drillRoot;if(e&&!e.isConnected){Y();return}h(document.querySelectorAll("[data-ref]"),function(t){if(O(t))for(var a=!!e&&t!==e&&!e.contains(t),o=Ki(t),i=0;i<o.length;i++){var n=o[i];n&&n.classList&&n.classList.contains(Sa)!==a&&n.classList.toggle(Sa,a)}})}function Yi(){if(r.drillBar)return r.drillBar;var e=document.createElement("nav");return e.className="stadiaref-drill",e.setAttribute("aria-label","Drill-down"),e.hidden=!0,r.shadowRoot.appendChild(e),r.drillBar=e,e}function Fa(e,t,a){var o=document.createElement("button");return o.type="button",o.className="stadiaref-drill__crumb",o.textContent=e,a&&o.setAttribute("aria-current","true"),o.addEventListener("click",function(i){i.stopPropagation(),t()}),o}function Ta(){var e=Yi();e.innerHTML="";var t=r.drillRoot;if(!t){e.hidden=!0;return}e.appendChild(Fa("All",Y,!1));for(var a=[],o=t;o;o=o.parentElement)o.nodeType===1&&o.hasAttribute("data-ref")&&a.unshift(o);a.forEach(function(i){var n=document.createElement("span");n.className="stadiaref-drill__sep",n.setAttribute("aria-hidden","true"),n.textContent="/",e.appendChild(n),e.appendChild(Fa(i.getAttribute("data-ref"),function(){Ue(i)},i===t))}),e.hidden=!1}function Ue(e){return!r.drillEnabled||!e||!e.getAttribute||!e.getAttribute("data-ref")||!b()?!1:(r.drillRoot=e,r.closeCard&&r.closeCard(),P("drill",e),Ta(),kt(),C(),y("drill",{address:e.getAttribute("data-ref"),tier:_(e),element:e}),!0)}function Y(){return r.drillRoot?(r.drillRoot=null,L("drill"),Ta(),kt(),C(),y("drill",{address:null,tier:null,element:null}),!0):!1}function Oa(){return!!r.drillRoot}function Xi(e){for(var t=[],a=e.parentElement;a;)a.hasAttribute&&a.hasAttribute("data-ref")&&t.unshift({el:a,ref:a.getAttribute("data-ref"),refClass:_(a),current:!1}),a=a.parentElement;return t.push({el:e,ref:e.getAttribute("data-ref"),refClass:_(e),current:!0}),t}var Ji='<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"></path><path d="M8 3h8l-1 7 3 4H6l3-4z"></path></svg>';function Ba(e){var t=r.activeRefTreePinned;e.setAttribute("aria-pressed",t?"true":"false"),e.setAttribute("aria-label",t?"Unpin address chain":"Pin address chain"),e.lastChild.textContent=t?"Pinned":"Pin"}function Zi(e,t){var a=document.createElement("button");a.type="button",a.className="stadiaref-active-ref-tree__row"+(e.current?" stadiaref-active-ref-tree__row--current":""),a.style.paddingLeft=12+t*14+"px",a.title="Copy "+e.ref,e.current&&a.setAttribute("aria-current","true"),a.appendChild(z(e.el));var o=document.createElement("span");return o.className="stadiaref-active-ref-tree__row-ref",o.textContent=e.ref,a.appendChild(o),a.addEventListener("click",function(i){i.stopPropagation(),Q(e.el,e.ref,a,"label")}),a}function en(e,t){var a=Xi(t);r.activeRefTree.innerHTML="",r.activeRefTree.setAttribute("role","dialog"),r.activeRefTree.setAttribute("aria-label","Address chain");var o=document.createElement("div");o.className="stadiaref-active-ref-tree__header";var i=document.createElement("span");i.className="stadiaref-active-ref-tree__title",i.textContent="Address chain";var n=document.createElement("button");n.type="button",n.className="stadiaref-active-ref-tree__pin",n.innerHTML=Ji+"<span></span>",Ba(n),n.addEventListener("click",function(d){d.stopPropagation(),r.activeRefTreePinned=!r.activeRefTreePinned,Ba(n)}),o.appendChild(i),o.appendChild(n),r.activeRefTree.appendChild(o);var s=document.createElement("div");s.className="stadiaref-active-ref-tree__rows";for(var l=0;l<a.length;l++)s.appendChild(Zi(a[l],l));r.activeRefTree.appendChild(s)}function Ra(e){r.activeRefTreeHideTimer&&(clearTimeout(r.activeRefTreeHideTimer),r.activeRefTreeHideTimer=null),!(!e||!e.element||!e.element.getAttribute("data-ref"))&&(en(e.dataRef,e.element),r.activeRefTree.classList.add("stadiaref-active-ref-tree--open"),r.activeRefTreeOpen=!0)}function Qa(){r.activeRefTreePinned||(r.activeRefTreeHideTimer=setTimeout(function(){r.activeRefTree.classList.remove("stadiaref-active-ref-tree--open"),r.activeRefTreeOpen=!1,r.activeRefTreeHideTimer=null},120))}function _t(){r.activeRefTreePinned=!1,r.activeRefTree.classList.remove("stadiaref-active-ref-tree--open"),r.activeRefTreeOpen=!1,r.activeRefTreeHideTimer&&(clearTimeout(r.activeRefTreeHideTimer),r.activeRefTreeHideTimer=null)}function Lt(){r.presentationMode?Ma():Pa()}function We(){r.presentationMode||(q(),r.treeOpen&&H(),_t(),M(),K(),Y(),r.stopPick&&r.stopPick(),r.closeFind&&r.closeFind(),r.presentationMode=!0,Lt(),y("hide",{}))}function ne(){r.presentationMode&&(r.presentationMode=!1,Lt(),y("show",{}))}function At(){r.presentationMode?ne():We()}var tn="stadiaref";function Da(){return document.querySelector("astro-dev-toolbar")}function xr(){var e=Da(),t=e&&e.shadowRoot,a=t&&t.querySelector('astro-dev-toolbar-app-canvas[data-app-id="'+tn+'"]');return a&&a.shadowRoot||null}function Ve(){return!!xr()}function Ha(){var e=Da(),t=e&&e.shadowRoot,a=t&&t.querySelector("#dev-bar");if(!a)return 0;var o=a.getBoundingClientRect();return o.height?Math.max(0,Math.round(window.innerHeight-o.top)):0}var rn=[":host { all: initial; }",".stadiaref-panel { position: fixed; left: 50%; bottom: 84px; transform: translateX(-50%); box-sizing: border-box; width: min(400px, calc(100vw - 24px)); padding: 16px; display: flex; flex-direction: column; gap: 14px; background: #13151A; color: #F4F4F5; border: 1px solid #343841; border-radius: 12px; box-shadow: 0 12px 32px rgba(0,0,0,0.35); font-family: "+R+"; font-size: 12px; pointer-events: auto; z-index: 2000000010; }",".stadiaref-panel__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }",".stadiaref-panel__brand { display: flex; align-items: center; gap: 8px; }",".stadiaref-panel__brand .stadiaref-brand__icon { width: 22px; height: 22px; }",".stadiaref-brand__disc { fill: #A3E635; }",".stadiaref-brand__stadia { fill: #F4F4F5; }",".stadiaref-brand__ref { fill: #A3E635; }",".stadiaref-panel__brand .stadiaref-brand__logotype { width: 74px; height: 13px; }",".stadiaref-panel__version { font-size: 11px; color: #A1A1AA; }",".stadiaref-panel__auto { padding: 1px 6px; border: 1px dashed #A1A1AA; border-radius: 4px; color: #E4E4E7; font-family: ui-monospace, monospace; font-size: 10px; font-weight: 700; }",".stadiaref-panel__auto[hidden] { display: none; }",".stadiaref-panel__grid { display: grid; grid-template-columns: 64px minmax(0, 1fr); align-items: center; gap: 10px 12px; }",".stadiaref-panel__key { font-size: 10px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: #A1A1AA; }",".stadiaref-panel__seg { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2px; padding: 2px; background: #25272E; border-radius: 8px; }",".stadiaref-panel button { font-family: inherit; font-size: 12px; cursor: pointer; }",".stadiaref-panel__seg button { min-height: 32px; border: 0; border-radius: 6px; background: transparent; color: #E4E4E7; }",'.stadiaref-panel__seg button[aria-pressed="true"] { background: #A3E635; color: #000000; font-weight: 700; }',".stadiaref-panel__foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 12px; border-top: 1px solid #343841; }",".stadiaref-panel__count { color: #D4D4D8; }",".stadiaref-panel__actions { display: flex; gap: 6px; }",".stadiaref-panel__actions button { min-height: 32px; padding: 0 10px; border: 1px solid #52525B; border-radius: 6px; background: transparent; color: #F4F4F5; font-weight: 600; }",'.stadiaref-panel__actions button[aria-pressed="true"] { border-color: #A3E635; color: #A3E635; }',".stadiaref-panel button:focus-visible { outline: 2px solid #00C0F3; outline-offset: 2px; box-shadow: 0 0 0 2px #000000; }"].join(`
`),an=[["full","Full"],["icons","Icons"],["off","Off"]],on=[["section","Sections"],["block","Blocks"],["element","Elements"]],nn=[["off","Off"],["section","Sections"],["block","Blocks"]];function S(e,t,a){var o=document.createElement(e);return t&&(o.className=t),a&&(o.textContent=a),o}function Et(e,t){var a=S("button","",e);return a.type="button",a.addEventListener("click",function(o){o.stopPropagation(),r.presentationMode&&ne(),t(),Ct()}),a}function yr(e,t,a){var o=S("div","stadiaref-panel__seg");return o.setAttribute("role","group"),o.setAttribute("aria-label",e),t.forEach(function(i){var n=Et(i[1],function(){a(i[0])});n.setAttribute("data-value",i[0]),n.setAttribute("aria-pressed","false"),o.appendChild(n)}),o}function sn(e){var t=S("style");t.textContent=rn;var a=S("div","stadiaref-panel");a.setAttribute("role","region"),a.setAttribute("aria-label","StadiaRef");var o=S("div","stadiaref-panel__head"),i=S("div","stadiaref-panel__brand");i.innerHTML=rt+at;var n=S("div","stadiaref-panel__brand"),s=S("span","stadiaref-panel__auto","AUTO");s.title="Auto-address is on",n.appendChild(s),n.appendChild(S("span","stadiaref-panel__version",ee+" \xB7 dev only")),o.appendChild(i),o.appendChild(n);var l=S("div","stadiaref-panel__grid");l.appendChild(S("span","stadiaref-panel__key","Labels")),l.appendChild(yr("Labels",an,Ie)).setAttribute("data-stadiaref-panel","labels"),l.appendChild(S("span","stadiaref-panel__key","Show")),l.appendChild(yr("Show tiers",on,se)).setAttribute("data-stadiaref-panel","tiers"),l.appendChild(S("span","stadiaref-panel__key","Outline")),l.appendChild(yr("Outline",nn,I)).setAttribute("data-stadiaref-panel","outline");var d=S("div","stadiaref-panel__foot"),f=S("span","stadiaref-panel__count");f.setAttribute("aria-live","polite");var c=S("div","stadiaref-panel__actions"),g=Et("Pick",wt);g.setAttribute("data-stadiaref-panel","pick");var u=Et("Find",function(){we()?j():Ae()});u.setAttribute("data-stadiaref-panel","find");var m=Et("Tree",H);return m.setAttribute("data-stadiaref-panel","tree"),c.appendChild(g),c.appendChild(u),c.appendChild(m),d.appendChild(f),d.appendChild(c),a.appendChild(o),a.appendChild(l),a.appendChild(d),a.insertBefore(t,a.firstChild),e.appendChild(a),a}function Fe(e,t){var a=r.panel.querySelector('[data-stadiaref-panel="'+e+'"]');if(a)for(var o=a.tagName==="BUTTON"?[a]:a.querySelectorAll("button"),i=0;i<o.length;i++)o[i].setAttribute("aria-pressed",t(o[i].getAttribute("data-value"))?"true":"false")}function Ct(){if(r.panel){var e=qe(),t=X();Fe("labels",function(o){return o===e}),Fe("tiers",function(o){return t.indexOf(o)!==-1}),Fe("outline",function(o){return o===r.outlineMode}),Fe("pick",ke),Fe("find",we),Fe("tree",function(){return!!r.treeOpen}),r.panel.querySelector(".stadiaref-panel__auto").hidden=!r.autoRefEnabled;var a=document.querySelectorAll("[data-ref]").length;r.panel.querySelector(".stadiaref-panel__count").textContent=a+(a===1?" address":" addresses")}}var ln=["labels-change","tiers-change","outline-change","auto-address-change","show","hide"];function Te(){var e=xr();if(e&&(!r.panel||r.panel.getRootNode()!==e)&&(r.panel&&r.panel.parentNode&&r.panel.parentNode.removeChild(r.panel),r.panel=sn(e),r.afterSurvey=Ct,r.panelListening||(r.panelListening=!0,ln.forEach(function(a){window.addEventListener("stadiaref:"+a,Ct)})),Ct()),r.toolbar){var t=Ve()?"none":"";r.toolbar.style.display!==t&&(r.toolbar.style.display=t,B())}}function b(){return r.mounted&&!r.presentationMode}function dn(){r.mounted||(document.body.appendChild(r.shadowHost),ir(),r.mounted=!0,ga())}function fn(e,t,a){a===null?e.hasAttribute(t)&&e.removeAttribute(t):e.getAttribute(t)!==a&&e.setAttribute(t,a)}function D(){if(r.mounted)for(var e=document.documentElement,t=Ot.filter(function(i){return!r.tiers[i]}),a=[["data-stadiaref-visible",r.presentationMode?null:""],["data-stadiaref-labels",lr[r.state]||"full"],["data-stadiaref-mode",r.pickMode?"pick":null],["data-stadiaref-hidden-tiers",t.length?t.join(" "):null]],o=0;o<a.length;o++)fn(e,a[o][0],a[o][1]),ca(a[o][0],a[o][1])}function ie(){b()&&(da(),Oe(),r.autoRefEnabled?St():Ft(),Tt(),C(),Ne(),r.treeOpen&&pe(),ve(),ye(),r.drillRoot&&kt(),Te(),B(),r.afterSurvey&&r.afterSurvey(),ba(),cr())}function Pa(){dn(),r.shadowHost.style.display="",Pe(),Te(),B(),D(),ie()}function Ma(){r.mounted&&(r.shadowHost.style.display="none",r.mountHost&&(r.mountHost.style.display="none"),D(),ye())}function Oe(){if(r.classConverterEnabled){var e=document.querySelectorAll('[class*="dataref-"]');h(e,function(t){if(!t.getAttribute("data-ref")){for(var a=(t.getAttribute("class")||"").split(/\s+/),o=0;o<a.length;o++)if(a[o].indexOf("dataref-")===0){t.setAttribute("data-ref",a[o].replace("dataref-",""));break}}})}}var Bt=[".e-con:not(.e-con .e-con)","section.brxe-section",".brxe-container:not(.brxe-container .brxe-container)",".ct-section",".breakdance-section",'body > section, main > section, [role="main"] > section',"#content > section, .site-content > section, .page-content > section","#content > div > section"],kr=[".e-con .e-con",'[class*="elementor-widget-"]',".brxe-block",".brxe-div",'[class*="brxe-"]:not(section)',".ct-div",".ct-column",".ct-text-block",".ct-headline",".ct-image",".ct-button",".breakdance-column",'[class*="breakdance-"]:not([class*="breakdance-section"])',"article","aside","nav",".wp-block-group",".wp-block-column",".wp-block-columns",".wp-block-cover",".wp-block-media-text",'[class*="wp-block-"]'],_r=["h1","h2","h3","h4","h5","h6","p","blockquote","figure","figcaption","img","video","audio","a[href]","button","input","select","textarea","form","table","ul","ol","dl","article","aside","nav","header","footer","details","summary","label","legend",'[class*="elementor-widget-"]','[class*="brxe-"]',".ct-text-block",".ct-headline",".ct-image",".ct-button",".ct-link-text",".ct-video",".ct-icon",".ct-fancy-image",'[class*="breakdance-"]'],pn=Bt.concat(kr).concat(_r),un={section:Bt,block:kr,element:_r,all:pn};function wr(e,t){for(var a=0;a<t.length;a++)if(Kt(e,t[a]))return!0;return!1}function hn(e,t){return t==="section"||t==="block"||t==="element"?t:wr(e,Bt)?"section":wr(e,kr)?"block":wr(e,_r)?"element":"unclassified"}function ht(e){var t=un[e]||Bt,a=document.querySelectorAll(t.join(", ")),o=[];return h(a,function(i){if(!ot(o,i))if(e!=="section")o.push(i);else{for(var n=!1,s=0;s<o.length;s++)if(o[s].contains(i)){n=!0;break}n||o.push(i)}}),o.sort(function(i,n){var s=i.compareDocumentPosition(n);return s&Node.DOCUMENT_POSITION_FOLLOWING?-1:1}),o}var gn=["h1","h2","h3","h4","h5","h6","p","blockquote","img","video","audio","button","a","input","select","textarea","form","table","ul","ol","dl","nav","article","aside","header","footer","figure","figcaption","details","summary","label","legend","section"];function Rt(e){var t=e.tagName.toLowerCase();if(gn.indexOf(t)!==-1)return t;var a=e.querySelector("h1, h2, h3, h4, h5, h6");if(a)return a.tagName.toLowerCase();var o=e.querySelector("img, video, audio, button, a, p, form, table, blockquote, figure");if(o)return o.tagName.toLowerCase();var i=e.getAttribute("class")||"",n=i.match(/elementor-widget-([\w-]+)/);if(n)return n[1];var s=i.match(/brxe-([\w-]+)/);if(s)return s[1];var l=i.match(/ct-([\w-]+)/);if(l)return l[1];var d=i.match(/breakdance-([\w-]+)/);if(d&&d[1]!=="section"&&d[1]!=="column")return d[1];var f=i.match(/wp-block-([\w-]+)/);return f?f[1]:t}function bn(){if(r.config.pageSlug)return r.config.pageSlug;var e=window.location.pathname;if(window.location.protocol==="file:"){var t=e.split("/").pop()||"",a=t.replace(/-wireframe-lf\.html$/i,"").replace(/-wireframe-hf\.html$/i,"").replace(/-wireframe\.html$/i,"").replace(/\.html$/i,"");return a||"home"}return e=e.replace(/^\/|\/$/g,"").replace(/\//g,"-"),e||"home"}function Na(e){return String(e||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}function vn(e){var t=Na(bn())||"home",a=Na(Rt(e))||"el",o={};h(document.querySelectorAll("[data-ref]"),function(l){o[l.getAttribute("data-ref")]=!0});var i;do{r.autoCounter++;var n=String(r.autoCounter);n.length<2&&(n="0"+n);var s="-"+n+"-"+a;i=t.slice(0,cn-s.length).replace(/-+$/,"")+s}while(o[i]);return i}function St(){if(!(!r.autoRefEnabled||!b()))for(var e=ht(r.autoRefDepth),t=0;t<e.length;t++){var a=e[t];if(!a.getAttribute("data-ref")){var o=r.autoAddresses.get(a);o||(o=vn(a),r.autoAddresses.set(a,o)),a.setAttribute("data-ref",o),a.setAttribute("data-stadiaref-auto","1"),a.setAttribute("data-stadiaref-auto-tier",hn(a,r.autoRefDepth))}}}function Ft(){if(b()){var e=document.querySelectorAll("[data-stadiaref-auto]");h(e,function(t){Lr(t),t.removeAttribute("data-ref"),t.removeAttribute("data-stadiaref-auto"),t.removeAttribute("data-stadiaref-auto-tier")})}}var mn=2,xn=4,yn=18,wn=6,kn=10,za=30,_n=6,Ia=18;function Wa(e){for(var t=0,a=e.parentElement;a;)a.hasAttribute("data-ref")&&t++,a=a.parentElement;return t}function Ln(e){var t=e*kn;return t>za&&(t=za),t}function Ar(e){var t=e*_n;return t>Ia&&(t=Ia),t}function Er(e,t,a){var o=mn+t+"px",i=Ln(a||0),n=p(e).icon,s=p(e).link,l=p(e).tooltip,d=p(e).fullLabel;n&&(n.style.top=o),s&&(s.style.height=t+"px",s.style.opacity=t>0?"1":"0"),l&&(l.style.top=o,l.style.left=22+i+"px"),d&&(d.style.top=o,d.style.left=2+i+"px")}function An(){var e=document.querySelectorAll("[data-ref]");h(e,function(t){p(t).depth=Wa(t),Er(t,Ar(p(t).depth||0),p(t).depth||0)})}function Qt(e){return r.presentationMode||r.state===1?null:r.state===2?p(e).fullLabel:p(e).icon}function C(){var e,t=[];if(b()&&(ve(),An(),En(),$a(),r.state!==1)){r.tiers.block&&r.tiers.element&&Ga(),e=te(document.querySelectorAll("[data-ref]")),e.sort(function(n,s){var l=n.compareDocumentPosition(s);return l&Node.DOCUMENT_POSITION_FOLLOWING?-1:1});var a=[];h(e,function(n){if(p(n).visible!==!1&&!(p(n).blockGroupMember||p(n).collapsed)&&!fa(n)&&!(r.drillRoot&&n!==r.drillRoot&&!r.drillRoot.contains(n))&&Mt(p(n).tier)){var s=Qt(n);s&&a.push({el:n,anchor:s})}});var o=a.map(function(n){return n.anchor.getBoundingClientRect()});a.forEach(function(n,s){for(var l=n.el,d=o[s],f=Ar(p(l).depth||0),c=null,g=null,u=0;u<wn;u++){var m=u*yn;g={left:d.left,right:d.right,top:d.top+m,bottom:d.bottom+m},c=null;for(var v=0;v<t.length;v++)if(zr(g,t[v].rect,xn)){c=t[v];break}if(!c){u&&Er(l,f+m,p(l).depth||0);break}}c?Cn(c.owner,l):t.push({rect:g,owner:l})});for(var i=0;i<t.length;i++)Sn(t[i].owner)}}function En(){var e=ae(".stadiaref-ref-clustered");h(e,function(o){o.classList.remove("stadiaref-ref-clustered")});var t=ae(".stadiaref-cluster-badge");h(t,fe);var a=document.querySelectorAll("[data-ref]");h(a,function(o){p(o).cluster=null,p(o).clusterBadge=null})}function Cn(e,t){p(e).cluster||(p(e).cluster=[]),p(e).cluster.push(t);for(var a=[p(t).icon,p(t).tooltip,p(t).fullLabel,p(t).link],o=0;o<a.length;o++)a[o]&&a[o].classList.add("stadiaref-ref-clustered")}function Sn(e){var t=p(e).cluster;if(!(!t||t.length===0)){var a=Qt(e);if(a){var o=me(e),i=o<.4?"stadiaref-on-dark":"stadiaref-on-light",n=document.createElement("span");n.className="stadiaref-cluster-badge "+i,n.textContent="+"+t.length,n.title=t.length+" more ref"+(t.length===1?"":"s")+" here \u2014 hover to expand";var s=parseFloat(a.style.top||"2"),l=parseFloat(a.style.left||"2"),d=a.getBoundingClientRect().width;n.style.top=s+"px",n.style.left=l+d+4+"px";var f=document.createElement("span");f.className="stadiaref-cluster-popover";for(var c=0;c<t.length;c++){var g=t[c],u=g.getAttribute("data-ref"),m=Rt(g),v=document.createElement("span");v.className="stadiaref-cluster-item";var x=document.createElement("span");x.className="stadiaref-cluster-item-tag",x.textContent=m;var N=document.createElement("span");N.className="stadiaref-cluster-item-ref",N.textContent=u,v.appendChild(x),v.appendChild(N),(function(F,Z,Gt){v.addEventListener("click",function(et){et.stopPropagation(),et.preventDefault(),he(Z,F,Gt)})})(u,g,v),f.appendChild(v)}n.appendChild(f),be(e).appendChild(n),p(e).clusterBadge=n}}}function Fn(e){return be(e)}function oe(e){if(!O(e))return!1;var t=p(e);return!!(t.fullLabel&&t.fullLabel.isConnected&&t.icon&&t.icon.isConnected&&t.address===e.getAttribute("data-ref"))}function Lr(e){if(O(e)){for(var t=p(e),a=[t.link,t.icon,t.tooltip,t.fullLabel,t.clusterBadge,t.groupBadge],o=0;o<a.length;o++)fe(a[o]);if(pt(e),!t.slot){Ir(e);return}var i=t.slot;for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&delete t[n];t.slot=i}}var Tn={section:"SEC",block:"BLK",element:"EL",unclassified:"?"},On={section:"S",block:"B",element:"E",unclassified:"?"};function qa(e){var t=document.createElement("span");return t.className="stadiaref-ref-address",t.textContent=e,t}function Bn(){var e=document.createElement("span");return e.className="stadiaref-ref-tag",e}function Tt(){if(b()){var e=document.querySelectorAll("[data-ref]");h(e,function(t){if(!oe(t)){Lr(t);var a=t.getAttribute("data-ref"),o=Rt(t),i=t.hasAttribute("data-stadiaref-auto"),n=_(t);n==="unclassified"&&typeof console<"u"&&console.warn&&console.warn("[stadiaref] unclassified address:",a);var s=me(t),l=s<.4?"stadiaref-on-dark":"stadiaref-on-light",d=i?" stadiaref-auto":"",f=Fn(t);la(t);var c=document.createElement("span");c.className="stadiaref-ref-icon "+l+d,c.setAttribute("role","button"),c.tabIndex=-1,c.title=a+" (click to copy)",c.addEventListener("click",function(x){x.stopPropagation(),x.preventDefault(),he(t,a,c)}),c.addEventListener("mouseenter",function(){$("hover",t,a,c)}),c.addEventListener("mouseleave",function(){$("leave",t,a,c)});var g=document.createElement("span");g.className="stadiaref-ref-tooltip "+l,g.appendChild(qa(a)),g.addEventListener("click",function(x){x.stopPropagation(),x.preventDefault(),he(t,a,g)});var u=document.createElement("span");u.className="stadiaref-ref-full-label "+l+d,u.appendChild(Bn()),u.appendChild(qa(a)),u.title="Click to copy: "+a+(o?" ("+o+")":""),u.addEventListener("click",function(x){x.stopPropagation(),x.preventDefault(),he(t,a,u)}),u.addEventListener("mouseenter",function(){$("hover",t,a,u)}),u.addEventListener("mouseleave",function(){$("leave",t,a,u)});var m=document.createElement("span");m.className="stadiaref-ref-link "+l,f.appendChild(m),f.appendChild(c),f.appendChild(g),f.appendChild(u);var v=p(t);v.address=a,v.auto=i,v.icon=c,v.link=m,v.tooltip=g,v.fullLabel=u,v.depth=Wa(t),Er(t,Ar(v.depth),v.depth),Va(t,n)}}),Rn(),He()}}function Rn(){var e={},t={};h(document.querySelectorAll("[data-ref]"),function(a){var o=a.getAttribute("data-ref");if(e[o]&&!t[o]&&(t[o]=!0,typeof console<"u"&&console.warn&&console.warn("[stadiaref] duplicate address on this screen:",o)),e[o]=!0,!!oe(a)){var i=_(a);p(a).tier!==i&&Va(a,i)}})}var Ua=["stadiaref-tier-section","stadiaref-tier-block","stadiaref-tier-element","stadiaref-tier-unclassified"];function Va(e,t){var a=p(e);a.tier=t;for(var o=[a.icon,a.tooltip,a.fullLabel,a.link],i=0;i<o.length;i++){var n=o[i];if(n){for(var s=0;s<Ua.length;s++)n.classList.remove(Ua[s]);n.classList.add("stadiaref-tier-"+t)}}a.icon&&(a.icon.textContent=On[t]),a.fullLabel&&(a.fullLabel.firstChild.textContent=a.auto?"AUTO":Tn[t])}function Pt(e){return O(e)?p(e).tier:void 0}var Ot=["section","block","element"],Qn={SBE:"All",SB:"Sec + Blk",S:"Sections",B:"Blocks",E:"Elements",BE:"Blk + El",SE:"Sec + El","":"None"};function X(){return Ot.filter(function(e){return r.tiers[e]})}function Mt(e){return e==="unclassified"?r.tiers.section&&r.tiers.block&&r.tiers.element:!!r.tiers[e]}function Me(){var e=(r.tiers.section?"S":"")+(r.tiers.block?"B":"")+(r.tiers.element?"E":"");return Qn[e]}function Cr(e){if(!Array.isArray(e))return null;for(var t={section:!1,block:!1,element:!1},a=0;a<e.length;a++){if(Ot.indexOf(e[a])===-1)return null;t[e[a]]=!0}return t}function Pn(){Dt(),r.treeOpen&&pe(),b()&&(D(),C())}function Be(e){var t=Cr(e);if(!t){typeof console<"u"&&console.warn&&console.warn('[stadiaref] setTiers expected an array of "section", "block", "element", got',e);return}r.tiers=t,Pn(),y("tiers-change",{tiers:X()})}function se(e){var t=X(),a=t.indexOf(e);a===-1?t.push(e):t.splice(a,1),Be(t)}function ja(){return!!r.autoRefEnabled}function Ka(e){if(typeof e!="boolean"){typeof console<"u"&&console.warn&&console.warn("[stadiaref] setAutoAddress expected true or false, got",e);return}$e(e?"all":"off")}function $e(e){e==="off"?r.autoRefEnabled=!1:(r.autoRefEnabled=!0,r.autoRefDepth=e),Ht(),b()&&(Ft(),r.autoRefEnabled&&(Oe(),St()),Tt(),C(),Ne()),r.treeOpen&&pe(),y("auto-address-change",{autoAddress:r.autoRefEnabled})}function Mn(e){for(var t=[],a=te(e.querySelectorAll("[data-ref]")),o=0;o<a.length;o++){var i=a[o];if(Pt(i)==="block"){for(var n=i.parentElement,s=!0;n&&n!==e;){if(Pt(n)==="section"){s=!1;break}n=n.parentElement}s&&t.push(i)}}return t}function $a(){h(ae(".stadiaref-collapsed"),function(t){t.classList.remove("stadiaref-collapsed")});var e=ae(".stadiaref-block-group-badge");h(e,fe),h(document.querySelectorAll("[data-ref]"),function(t){O(t)&&(p(t).blockGroupMember=!1,p(t).collapsed=!1,p(t).groupBadge=null)})}function Dn(e){for(var t=[e].concat(te(e.querySelectorAll("[data-ref]"))),a=0;a<t.length;a++)if(O(t[a])){var o=p(t[a]);o.collapsed=!0;for(var i=[o.icon,o.tooltip,o.fullLabel,o.link],n=0;n<i.length;n++)i[n]&&i[n].classList.add("stadiaref-collapsed")}}function Ga(){var e=te(document.querySelectorAll("[data-ref]")).filter(function(t){return Pt(t)==="section"});h(e,function(t){var a=Mn(t);if(!(a.length<=6)){var o=me(t),i=o<.4?"stadiaref-on-dark":"stadiaref-on-light",n=document.createElement("span");n.className="stadiaref-block-group-badge stadiaref-tier-block "+i,n.textContent="+"+a.length+" blocks";var s=Qt(t),l=s?parseFloat(s.style.top||"2")+20:22,d=s?parseFloat(s.style.left||"2"):2;n.style.top=l+"px",n.style.left=d+"px";var f=document.createElement("span");f.className="stadiaref-block-group-popover";for(var c=0;c<a.length;c++){var g=a[c],u=g.getAttribute("data-ref"),m=u.split("-"),v=m.length>=2?m[m.length-2]:"block",x=document.createElement("span");x.className="stadiaref-block-group-item";var N=document.createElement("span");N.className="stadiaref-block-group-item-type",N.textContent=v;var F=document.createElement("span");F.className="stadiaref-block-group-item-ref",F.textContent=u,x.appendChild(N),x.appendChild(F),(function(Gt,et,Hr){Hr.addEventListener("click",function(Nr){Nr.stopPropagation(),Nr.preventDefault(),he(et,Gt,Hr)})})(u,g,x),f.appendChild(x)}n.appendChild(f),be(t).appendChild(n),p(t).groupBadge=n;for(var Z=0;Z<a.length;Z++)p(a[Z]).blockGroupMember=!0,Dn(a[Z])}})}var Ya=[{tier:"section",name:"Sections",note:"top-level sections"},{tier:"block",name:"Blocks",note:"containers inside a section"},{tier:"element",name:"Elements",note:"headings, text, images, buttons"}],Ge=[{state:2,name:"Full",note:"every address shown"},{state:0,name:"Icons",note:"a dot, hover to read"},{state:1,name:"Off",note:"clean page"}],je=[{mode:"block",name:"Blocks",note:"sections plus inner containers"},{mode:"section",name:"Sections",note:"top-level wrappers only"},{mode:"off",name:"Off",note:"no guides"}],Hn='<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="7"></circle><path d="M12 2v5"></path><path d="M12 17v5"></path><path d="M2 12h5"></path><path d="M17 12h5"></path></svg>',Nn='<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l5 5"></path></svg>',zn='<svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h7"></path><path d="M8 12h12"></path><path d="M8 19h12"></path><path d="M5 5v14h3"></path></svg>';function Xa(e,t,a,o,i,n){return'<button type="button" role="'+i+'" aria-checked="'+(n?"true":"false")+'" class="stadiaref-toolbar__option'+(n?" stadiaref-toolbar__option--active":"")+'" '+e+'="'+t+'"><span class="stadiaref-toolbar__option-dot" aria-hidden="true"></span><span>'+a+'</span><span class="stadiaref-toolbar__note">'+o+"</span></button>"}function Sr(e,t,a,o,i,n){return'<button type="button" class="stadiaref-toolbar__select'+(i||"")+'" data-stadiaref-toggle="'+e+'" aria-haspopup="menu" aria-expanded="false" aria-controls="stadiaref-menu-'+e+'">'+(n?'<span class="stadiaref-toolbar__dot" aria-hidden="true"></span>':"")+'<span class="stadiaref-toolbar__key stadiaref-toolbar__key--long">'+t+'</span><span class="stadiaref-toolbar__key stadiaref-toolbar__key--short" data-stadiaref-short="'+e+'" aria-hidden="true">'+a+'</span><span class="stadiaref-toolbar__value">'+o+'</span><span class="stadiaref-toolbar__caret" aria-hidden="true">&#9662;</span></button>'}function Ja(){for(var e="",t=0;t<Ge.length;t++)e+=Xa("data-stadiaref-state",Ge[t].state,Ge[t].name,Ge[t].note,"menuitemradio",r.state===Ge[t].state);for(var a="",o=0;o<Ya.length;o++){var i=Ya[o];a+='<button type="button" class="stadiaref-toolbar__option stadiaref-toolbar__check" role="menuitemcheckbox" aria-checked="false" data-stadiaref-tier="'+i.tier+'"><span class="stadiaref-toolbar__tick" aria-hidden="true"></span><span class="stadiaref-toolbar__check-name">'+i.name+'</span><span class="stadiaref-toolbar__note">'+i.note+"</span></button>"}for(var n="",s=0;s<je.length;s++)n+=Xa("data-stadiaref-outline",je[s].mode,je[s].name,je[s].note,"menuitemradio",r.outlineMode===je[s].mode);return'<a class="stadiaref-brand" href="https://seguru.digital" target="_blank" rel="noopener" aria-label="StadiaRef by Seguru Digital">'+rt+at+'<span class="stadiaref-brand__tip" aria-hidden="true">StadiaRef '+ee+' by Seguru Digital</span></a><div class="stadiaref-toolbar__user" data-stadiaref-user-pill role="status"><span class="stadiaref-toolbar__user-avatar" data-stadiaref-user-avatar aria-hidden="true"></span><span class="stadiaref-toolbar__user-name" data-stadiaref-user-name></span><span class="stadiaref-toolbar__user-role" data-stadiaref-user-role></span></div><div class="stadiaref-toolbar__cluster stadiaref-toolbar__cluster--primary"><div class="stadiaref-toolbar__group" data-stadiaref-group="mode">'+Sr("mode","Labels","L",tt[r.state]||"Full",r.state!==1?" stadiaref-toolbar__select--active":"")+'<div class="stadiaref-toolbar__dropdown" id="stadiaref-menu-mode" data-stadiaref-menu="mode" role="menu" aria-label="Labels"><div class="stadiaref-toolbar__hint" data-stadiaref-mode-hint>Press L to cycle</div>'+e+'</div></div><div class="stadiaref-toolbar__group" data-stadiaref-group="show">'+Sr("show","Show","Show",Me(),"")+'<div class="stadiaref-toolbar__dropdown" id="stadiaref-menu-show" data-stadiaref-menu="show" role="menu" aria-label="Show"><div class="stadiaref-toolbar__hint" data-stadiaref-show-hint>Tick any mix. Keys 1, 2 and 3</div>'+a+'</div></div><span class="stadiaref-toolbar__auto" data-stadiaref-auto-chip role="status" aria-label="Auto-address is on" hidden>AUTO</span><button type="button" class="stadiaref-toolbar__select" data-stadiaref-pick aria-pressed="false">'+Hn+'<span>Pick</span></button><button type="button" class="stadiaref-toolbar__select" data-stadiaref-find aria-pressed="false">'+Nn+'<span>Find</span></button></div><div class="stadiaref-toolbar__cluster stadiaref-toolbar__cluster--utility"><div class="stadiaref-toolbar__group" data-stadiaref-group="outline">'+Sr("outline","Outline","O",de[r.outlineMode]||"Off"," stadiaref-toolbar__select--utility"+(r.outlineMode!=="off"?" stadiaref-toolbar__select--active":""),!0)+'<div class="stadiaref-toolbar__dropdown" id="stadiaref-menu-outline" data-stadiaref-menu="outline" role="menu" aria-label="Outline"><div class="stadiaref-toolbar__hint" data-stadiaref-outline-hint>Press O to cycle</div>'+n+'</div></div><button type="button" class="stadiaref-toolbar__select stadiaref-toolbar__select--utility" data-stadiaref-toggle-tree aria-pressed="false"><span class="stadiaref-toolbar__dot" aria-hidden="true"></span>'+zn+"<span>Tree</span></button></div>"}function q(){var e=r.toolbar.querySelectorAll(".stadiaref-toolbar__dropdown");h(e,function(t){t.classList.remove("stadiaref-toolbar__dropdown--open")}),h(r.toolbar.querySelectorAll("[data-stadiaref-toggle]"),function(t){t.classList.remove("stadiaref-toolbar__select--open"),t.setAttribute("aria-expanded","false")})}function Za(e,t){var a=r.toolbar.querySelector('[data-stadiaref-menu="'+e+'"]'),o=r.toolbar.querySelector('[data-stadiaref-toggle="'+e+'"]'),i=a.classList.contains("stadiaref-toolbar__dropdown--open");if(q(),!i){a.style.top="auto",a.style.bottom="auto",a.style.left="auto",a.style.right="auto",a.classList.add("stadiaref-toolbar__dropdown--open"),o&&(o.classList.add("stadiaref-toolbar__select--open"),o.setAttribute("aria-expanded","true"));var n=a.parentElement.getBoundingClientRect(),s=a.getBoundingClientRect(),l=window.innerWidth,d=window.innerHeight;if(n.top>d-n.bottom?a.style.bottom="calc(100% + 8px)":a.style.top="calc(100% + 8px)",n.left+s.width>l?a.style.right="0":a.style.left="0",t){var f=a.querySelector('[role^="menuitem"]');f&&f.focus()}}}function eo(){r.toolbar.addEventListener("keydown",function(e){if(!(e.key!=="ArrowDown"&&e.key!=="ArrowUp")){var t=e.target.closest&&e.target.closest(".stadiaref-toolbar__dropdown");if(t){var a=Array.prototype.slice.call(t.querySelectorAll('[role^="menuitem"]')),o=a.indexOf(e.target);if(o!==-1){e.preventDefault();var i=e.key==="ArrowDown"?(o+1)%a.length:(o-1+a.length)%a.length;a[i].focus()}}}})}function In(e,t){return e==="mode"?String(t)!=="1":e==="outline"?String(t)!=="off":!1}function gt(e,t,a,o){var i=r.toolbar.querySelector('[data-stadiaref-toggle="'+e+'"]'),n=i.querySelector(".stadiaref-toolbar__value");n&&(n.textContent=o),T(i,"stadiaref-toolbar__select--active",In(e,a));var s=r.toolbar.querySelectorAll('[data-stadiaref-menu="'+e+'"] .stadiaref-toolbar__option');h(s,function(l){var d=l.getAttribute(t)===String(a);T(l,"stadiaref-toolbar__option--active",d),l.setAttribute("aria-checked",d?"true":"false")}),q()}function Dt(){if(r.toolbar){var e=r.toolbar.querySelector('[data-stadiaref-toggle="show"]');e&&(e.querySelector(".stadiaref-toolbar__value").textContent=Me(),T(e,"stadiaref-toolbar__select--active",!(r.tiers.section&&r.tiers.block&&r.tiers.element)),h(r.toolbar.querySelectorAll("[data-stadiaref-tier]"),function(t){var a=Mt(t.getAttribute("data-stadiaref-tier"));t.setAttribute("aria-checked",a?"true":"false"),T(t,"stadiaref-toolbar__option--active",a),t.querySelector(".stadiaref-toolbar__tick").textContent=a?"\u2713":""}))}}function Ht(){if(r.toolbar){var e=r.toolbar.querySelector("[data-stadiaref-auto-chip]");e&&(e.hidden=!r.autoRefEnabled)}}function U(e){return e===!1?null:e.length===1?e.toUpperCase():e}function Nt(){if(!(!r.toolbar||!r.keys)){var e=r.keys,t=r.toolbar.querySelector("[data-stadiaref-mode-hint]");if(t){var a=[];U(e.labels)&&a.push("Press "+U(e.labels)+" to cycle"),U(e.toggle)&&a.push(U(e.toggle)+" to hide all"),t.textContent=a.join(" \xB7 "),t.hidden=!a.length}var o=r.toolbar.querySelector("[data-stadiaref-show-hint]");if(o){var i=[e.section,e.block,e.element].map(U).filter(Boolean);o.textContent="Tick any mix."+(i.length?" Keys "+i.slice(0,-1).join(", ")+(i.length>1?" and ":"")+i[i.length-1]:"")}var n=r.toolbar.querySelector('[data-stadiaref-short="mode"]');n&&(n.textContent=U(e.labels)||"Labels");var s=r.toolbar.querySelector('[data-stadiaref-short="outline"]');s&&(s.textContent=U(e.outline)||"Outline");var l=r.toolbar.querySelector("[data-stadiaref-outline-hint]");l&&(l.textContent=U(e.outline)?"Press "+U(e.outline)+" to cycle":"",l.hidden=!U(e.outline))}}var ro={"bottom-right":1,"bottom-left":1,"top-right":1,"top-left":1};function Fr(e){if(typeof e!="string")return null;var t=e.toLowerCase();return ro[t]||t==="host"?t:null}var Ke=20,to=8;function le(e,t){if(e&&(e.style.top="",e.style.bottom="",e.style.left="",e.style.right="",!!t))for(var a=t.split(";"),o=0;o<a.length;o++){var i=a[o];if(i){var n=i.indexOf(":");if(n!==-1){var s=i.slice(0,n).trim(),l=i.slice(n+1).trim();if(!(!s||!l)){var d=s.replace(/-([a-z])/g,function(f,c){return c.toUpperCase()});try{e.style[d]=l}catch{}}}}}}var zt=["top","right","bottom","left"];function It(e){if(!e||typeof e!="object")return null;for(var t={},a=!1,o=0;o<zt.length;o++){var i=Number(e[zt[o]]);typeof e[zt[o]]<"u"&&isFinite(i)&&(t[zt[o]]=i,a=!0)}return a?t:null}function qn(e){return V(e)}function Un(){if(r.position!=="host"||typeof r.mountSelector!="string"||!r.mountSelector)return null;var e=null;try{e=document.querySelector(r.mountSelector)}catch{return r.warnedMount||(r.warnedMount=!0,typeof console<"u"&&console.warn&&console.warn("[stadiaref] mount is not a valid selector:",r.mountSelector)),null}return!e||V(e)||r.scopeModal&&!r.scopeModal.contains(e)?null:e}function Wn(){if(r.mountHost)return r.mountHost;var e=document.createElement("div");e.className="stadiaref-mount",e.style.cssText="all:initial;display:inline-block;vertical-align:middle;max-width:100%;";var t=e.attachShadow({mode:"open"}),a=document.createElement("style");return a.textContent=r.shadowCss,t.appendChild(a),t.addEventListener("click",function(o){var i=o.target;i.closest&&(i.closest("[data-stadiaref-toggle]")||i.closest(".stadiaref-toolbar__dropdown"))||q()}),r.mountHost=e,r.mountRoot=t,e}function Vn(){var e=b()?Un():null;if(e){var t=Wn();t.parentNode!==e&&e.appendChild(t),t.style.display="",T(t,"stadiaref-theme-dark",r.resolvedTheme==="dark");var a=e.getBoundingClientRect().top<window.innerHeight/2?"top":"bottom";return t.getAttribute("data-stadiaref-dock")!==a&&t.setAttribute("data-stadiaref-dock",a),r.toolbar.parentNode!==r.mountRoot&&r.mountRoot.appendChild(r.toolbar),T(r.toolbar,"stadiaref-toolbar--inline",!0),le(r.toolbar,""),!0}return r.mountHost&&r.toolbar.parentNode===r.mountRoot&&(r.shadowRoot.insertBefore(r.toolbar,r.shadowRoot.firstChild?r.shadowRoot.firstChild.nextSibling:null),T(r.toolbar,"stadiaref-toolbar--inline",!1)),r.mountHost&&r.mountHost.parentNode&&!b()&&(r.mountHost.style.display="none"),!1}function $n(e){var t=window.innerWidth||document.documentElement.clientWidth,a=window.innerHeight||document.documentElement.clientHeight;if(!t||!a||typeof document.elementsFromPoint!="function")return 0;for(var o=e==="top"?1:a-2,i=0,n=[],s=[.1,.5,.9],l=0;l<s.length;l++)for(var d=document.elementsFromPoint(Math.round(t*s[l]),o),f=0;f<d.length;f++)for(var c=d[f];c&&c.nodeType===1&&c!==document.body&&c!==document.documentElement;c=c.parentElement)if(!(n.indexOf(c)!==-1||qn(c))){n.push(c);var g=window.getComputedStyle(c);if(!(g.position!=="fixed"&&g.position!=="sticky")){var u=c.getBoundingClientRect();if(!(u.width<t*.8)){var m=e==="top"?u.top<=1?u.bottom:0:u.bottom>=a-1?a-u.top:0;m>i&&m<a/2&&(i=m)}}}return Math.round(i)}function Gn(e,t){var a=r.dockOffset&&typeof r.dockOffset[e]=="number",o=0;return a?o=r.dockOffset[e]:e===t&&b()&&(o=$n(e),e==="bottom"&&Ve()&&(o=Math.max(o,Ha()))),"env(safe-area-inset-"+e+", 0px) + "+o+"px"}function _e(e,t,a){return"calc("+e+"px + "+Gn(t,a)+")"}function B(){var e=r.toolbar?Vn():!1,t=ro[r.position]?r.position:"bottom-right",a=t.split("-"),o=a[0],i=a[1],n=o==="top"?"bottom":"top",s=Ve()||e?Ke:Ke+(r.toolbar&&r.toolbar.offsetHeight||40)+to,l=r.dialogStatus&&!r.dialogStatus.hidden?r.dialogStatus.offsetHeight+to:0,d=i==="right"&&r.treeWidth||0,f=i+":"+_e(Ke+d,i,o)+";"+(i==="left"?"right:auto;":"left:auto;");e||le(r.toolbar,o+":"+_e(Ke,o,o)+";"+n+":auto;"+f),le(r.dialogStatus,o+":"+_e(s,o,o)+";"+n+":auto;"+f),le(r.toast,o+":"+_e(s+l,o,o)+";"+n+":auto;"+f),r.treeMode==="push"?le(r.treePanel,"top:0;bottom:0;right:0;left:auto"):le(r.treePanel,o+":"+_e(s+l,o,o)+";"+n+":auto;"+f),le(r.findPanel,o+":"+_e(s+l,o,o)+";"+n+":auto;"+f),le(r.activeRefTree,n+":"+_e(Ke,n,o)+";"+o+":auto;"+f);var c=r.position==="host"&&e?"host":t;r.shadowHost&&r.shadowHost.getAttribute("data-stadiaref-dock")!==c&&r.shadowHost.setAttribute("data-stadiaref-dock",c)}function Tr(){var e=window.innerWidth||document.documentElement.clientWidth||1024,t=window.innerHeight||document.documentElement.clientHeight||768,a={"bottom-right":{x1:e-220,y1:t-60,x2:e,y2:t},"bottom-left":{x1:0,y1:t-60,x2:220,y2:t},"top-right":{x1:e-220,y1:0,x2:e,y2:60},"top-left":{x1:0,y1:0,x2:220,y2:60}},o={"bottom-right":!1,"bottom-left":!1,"top-right":!1,"top-left":!1};if(!document.body)return"bottom-right";for(var i=document.body.querySelectorAll("*"),n=0;n<i.length;n++){var s=i[n];if(!(s===r.shadowHost||r.shadowHost&&r.shadowHost.contains(s))){var l;try{l=window.getComputedStyle(s)}catch{continue}if(l&&!(l.position!=="fixed"&&l.position!=="sticky")&&!(l.display==="none"||l.visibility==="hidden")){var d;try{d=s.getBoundingClientRect()}catch{continue}if(!(!d||d.width<100||d.height<100)){for(var f in a)if(Object.prototype.hasOwnProperty.call(a,f)){var c=a[f];d.right<c.x1||d.left>c.x2||d.bottom<c.y1||d.top>c.y2||(o[f]=!0)}}}}}for(var g=["bottom-right","bottom-left","top-right","top-left"],u=0;u<g.length;u++)if(!o[g[u]])return g[u];return"bottom-right"}function Or(e){var t;if(e==="auto"?t=Tr():e&&typeof e=="object"&&e.mount?(r.mountSelector=String(e.mount),t="host"):t=Fr(e),!t){typeof console<"u"&&console.warn&&console.warn("[stadiaref] setDock expected auto/bottom-right/bottom-left/top-right/top-left/host, got",e);return}r.position=t,q(),B()}var Br={toggle:"D",labels:"L",section:"1",block:"2",element:"3",pick:"P",find:"/",outline:"O",hide:"Escape"};function oo(){var e={};for(var t in Br)e[t]=Br[t];return e}function qt(e,t){var a={},o;for(o in e)a[o]=e[o];if(!t||typeof t!="object")return a;for(o in t)if(Object.prototype.hasOwnProperty.call(t,o)){var i=t[o];if(!Object.prototype.hasOwnProperty.call(Br,o)){ao('unknown key action "'+o+'"');continue}i===!1||typeof i=="string"&&i.length>0?a[o]=i:ao('key "'+o+'" expected a key name or false, got '+String(i))}return a}function ao(e){typeof console<"u"&&console.warn&&console.warn("[stadiaref] "+e)}function Ye(e){r.keys=qt(r.keys,e),Nt()}function io(){return qt(r.keys,null)}function J(e,t){return e===!1||typeof e!="string"||typeof t.key!="string"?!1:e.length===1?t.key.length===1&&t.key.toLowerCase()===e.toLowerCase():t.key.toLowerCase()===e.toLowerCase()}function jn(e){var t=typeof e.composedPath=="function"?e.composedPath():null;return t&&t.length?t[0]:e.target}function Kn(e){if(!e||e.nodeType!==1)return!1;var t=e.tagName;return!!(t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||e.isContentEditable)}function no(){window.addEventListener("keydown",function(e){if(!(e.ctrlKey||e.metaKey||e.altKey)&&!Kn(jn(e))){var t=r.keys;if(J(t.toggle,e)){e.preventDefault(),At();return}if(J(t.hide,e)){if(r.leaveMode&&r.leaveMode()){e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation&&e.stopImmediatePropagation();return}if(ha())return;r.presentationMode||(e.preventDefault(),We());return}if(J(t.labels,e)){e.preventDefault();var a=[1,0,2];xe(a[(a.indexOf(r.state)+1)%a.length]);return}if(J(t.section,e)){e.preventDefault(),se("section");return}if(J(t.block,e)){e.preventDefault(),se("block");return}if(J(t.element,e)){e.preventDefault(),se("element");return}if(J(t.outline,e)){e.preventDefault();var o=["off","section","block"],i=o.indexOf(r.outlineMode);i<0&&(i=0),I(o[(i+1)%o.length]);return}if(r.keyActions){if(J(t.pick,e)&&r.keyActions.pick){e.preventDefault(),r.keyActions.pick();return}if(J(t.find,e)&&r.keyActions.find){e.preventDefault(),r.keyActions.find();return}}}},!0)}var Yn={card:1,row:1,item:1,tab:1,slide:1,step:1,cell:1,column:1,panel:1,quote:1,entry:1,loop:1,form:1},Xn={heading:1,text:1,image:1,cta:1,media:1,link:1,wrapper:1,list:1};function so(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function lo(e){if(!e||typeof e!="string")return"unclassified";var t=e.split("-"),a=t.length;if(a<2)return"unclassified";var o=/^\d{2}$/,i=/^\d+$/;if(a>=6){var n=t[a-1],s=t[a-2],l=t[a-3],d=t[a-4];if(!i.test(n)&&o.test(s)&&o.test(l)&&so(Xn,d))return"element"}if(a>=4){var f=t[a-1],c=t[a-2];if(o.test(f)&&so(Yn,c))return"block"}return i.test(t[a-1])?"unclassified":"section"}var Ut="seguruDebugToolbar",fo="sdt:",co="seguru-debug-toolbar:theme";function uo(e){if(e===!1||e==="false"||e===null)return!1;if(typeof e>"u"||e==="")return"D";if(typeof e=="string"){var t=e.trim();if(!t)return"D";var a=t.charAt(0).toUpperCase();return/^[A-Z]$/.test(a)?a:(typeof console<"u"&&console.warn&&console.warn("[stadiaref] hotkey must be a single letter A\u2013Z, got",e,"\u2014 falling back to D"),"D")}return"D"}var Jn={0:"icons",1:"off",2:"full"},Re={all:["section","block","element"],"section-block":["section","block"],section:["section"]};function ho(e){for(var t in Re)if(Re[t].join(" ")===e.join(" "))return t;return"all"}function go(){return r.autoRefEnabled?r.autoRefDepth:"off"}function Zn(e){$e(e)}function es(e){if(!Object.prototype.hasOwnProperty.call(Re,e)){typeof console<"u"&&console.warn&&console.warn("[stadiaref] setLevelFilter expected all/section/section-block, got",e);return}Be(Re[e])}var ts={ready:"ready",show:"show",hide:"hide","theme-change":"theme-change","outline-change":"outline-change","user-change":"user-change","address-click":"dataref-click","address-hover":"dataref-hover","address-leave":"dataref-leave","auto-address-change":["depth-change",function(){return{depth:go()}}],"tiers-change":["level-filter-change",function(){return{levelFilter:ho(X())}}]};function bo(){var e=[];return typeof window.seguruDebugConfig<"u"&&window.seguruDebugConfig&&e.push(po(window.seguruDebugConfig)),typeof window.sdtConfig<"u"&&window.sdtConfig&&e.push(po(window.sdtConfig)),e}function po(e){var t={click:"copy"};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&(t[a]=e[a]);return t}function Je(e){var t={},a;for(a in e)Object.prototype.hasOwnProperty.call(e,a)&&(t[a]=e[a]);if(!("labels"in e)&&"defaultMode"in e){var o=Jn[parseInt(e.defaultMode,10)];o&&(t.labels=o)}if(!("outline"in e)&&"outlineMode"in e&&(t.outline=e.outlineMode),!("dock"in e)&&"position"in e&&(t.dock=e.position),!("tiers"in e)&&"levelFilter"in e&&Re[e.levelFilter]&&(t.tiers=Re[e.levelFilter].slice()),!("autoAddress"in e)&&"autoRef"in e&&(t.autoAddress=e.autoRef===!0||e.autoRef==="1"),"hotkey"in e&&!(e.keys&&"toggle"in e.keys)){if(t.keys={},e.keys&&typeof e.keys=="object")for(var i in e.keys)t.keys[i]=e.keys[i];t.keys.toggle=uo(e.hotkey)}return delete t.defaultMode,delete t.outlineMode,delete t.position,delete t.levelFilter,delete t.autoRef,delete t.hotkey,t}function vo(){try{var e=window.localStorage;if(!e)return;var t=e.getItem(co);if(t===null)return;e.getItem(Xe)===null&&e.setItem(Xe,t),e.removeItem(co)}catch{}}function rs(e,t){var a=ts[e];a&&(typeof a=="string"?nt(fo+a,t):nt(fo+a[0],a[1](t)))}function mo(e,t){e.setState=t(xe),e.getState=function(){return r.state},e.setDepth=t(Zn),e.getDepth=go,e.setLevelFilter=t(es),e.getLevelFilter=function(){return ho(X())},e.classifyDataRef=lo,e.setHotkey=t(function(o){Ye({toggle:uo(o)})}),e.getHotkey=function(){return r.keys.toggle},r.legacyEmit=rs;var a=!1;try{Object.defineProperty(window,Ut,{configurable:!0,enumerable:!1,get:function(){return a||(a=!0,typeof console<"u"&&console.info&&console.info("[stadiaref] window."+Ut+" is now window.stadiaref. The old name keeps working through 3.x.")),e},set:function(){}})}catch{window[Ut]=e}}function xo(){return!!window[Ut]}var yo=["profile","labels","tiers","autoAddress","outline","startHidden","theme","dock","keys","user","classConverter","pageSlug","autoRefDepth","watch","dockOffset","click","tree","mount","hint","drill"];function wo(){var e=[];typeof window.stadiarefConfig<"u"&&window.stadiarefConfig&&e.push(window.stadiarefConfig),e=e.concat(bo()),e=e.map(Je),e.push(Je(as()));for(var t={},a=0;a<yo.length;a++)for(var o=yo[a],i=0;i<e.length;i++)if(o in e[i]&&typeof e[i][o]<"u"){t[o]=e[i][o];break}for(var n={},s=e.length-1;s>=0;s--){var l=e[s].keys;if(l&&typeof l=="object")for(var d in l)Object.prototype.hasOwnProperty.call(l,d)&&(n[d]=l[d])}return Object.keys(n).length&&(t.keys=n),t}function as(){var e={},t={profile:"data-profile",labels:"data-labels",hotkey:"data-hotkey",theme:"data-theme",dock:"data-dock",position:"data-position",click:"data-click",tree:"data-tree",mount:"data-mount"};for(var a in t){var o=os(t[a]);typeof o<"u"&&(e[a]=o)}return e}function os(e){if(r.hostScriptEl){var t=r.hostScriptEl.getAttribute(e);return t===null?void 0:t}}var Xe="stadiaref:theme";function ko(){try{var e=window.localStorage&&window.localStorage.getItem(Xe);if(e==="light"||e==="dark"||e==="auto")return e}catch{}return null}function _o(e){try{window.localStorage&&window.localStorage.setItem(Xe,e)}catch{}}function is(){if(document.documentElement&&document.documentElement.classList&&document.documentElement.classList.contains("dark"))return"dark";if(window.matchMedia)try{if(window.matchMedia("(prefers-color-scheme: dark)").matches)return"dark"}catch{}return"light"}function Ze(){var e=r.theme==="light"||r.theme==="dark"?r.theme:is();T(r.shadowHost,"stadiaref-theme-dark",e==="dark"),r.mountHost&&T(r.mountHost,"stadiaref-theme-dark",e==="dark");var t=r.resolvedTheme;r.resolvedTheme=e,t!==e&&y("theme-change",{theme:e,mode:r.theme})}function Rr(){if(!(r.darkMediaQuery||!window.matchMedia)){try{r.darkMediaQuery=window.matchMedia("(prefers-color-scheme: dark)")}catch{r.darkMediaQuery=null;return}var e=function(){r.theme==="auto"&&Ze()};r.darkMediaQuery.addEventListener?r.darkMediaQuery.addEventListener("change",e):r.darkMediaQuery.addListener&&r.darkMediaQuery.addListener(e)}}function Lo(){if(!(r.htmlClassObserver||typeof MutationObserver>"u")&&document.documentElement)try{r.htmlClassObserver=new MutationObserver(function(){r.theme==="auto"&&Ze()}),r.htmlClassObserver.observe(document.documentElement,{attributes:!0,attributeFilter:["class"]})}catch{r.htmlClassObserver=null}}function Qr(e){if(e!=="auto"&&e!=="light"&&e!=="dark"){typeof console<"u"&&console.warn&&console.warn('[stadiaref] setTheme expected "auto" | "light" | "dark", got',e);return}r.theme=e,_o(e),Ze(),Rr()}function Ao(){return r.resolvedTheme}function Pr(){var e=r.toolbar.querySelector("[data-stadiaref-user-pill]");if(e){var t=e.querySelector("[data-stadiaref-user-avatar]"),a=e.querySelector("[data-stadiaref-user-name]"),o=e.querySelector("[data-stadiaref-user-role]");if(!r.currentUser||!r.currentUser.name){t&&(t.textContent=""),a&&(a.textContent=""),o&&(o.textContent="",o.style.display="none"),e.classList.remove("stadiaref-toolbar__user--visible"),e.removeAttribute("title");return}var i=String(r.currentUser.name),n=r.currentUser.role?String(r.currentUser.role):"",s=i.replace(/\s+/g," ").trim().charAt(0).toUpperCase()||"\xB7";t&&(t.textContent=s),a&&(a.textContent=i),o&&(n?(o.textContent=n,o.style.display=""):(o.textContent="",o.style.display="none")),e.title=n?i+" \xB7 "+n:i,e.classList.add("stadiaref-toolbar__user--visible")}}function Wt(e){if(!e||typeof e!="object")return null;var t={};return"name"in e&&(t.name=e.name),"role"in e&&(t.role=e.role),t}function Mr(e){if(e===null||typeof e>"u")r.currentUser=null;else if(typeof e=="object")r.currentUser=Wt(e);else return;Pr(),y("user-change",{user:Dr()})}function Dr(){return Wt(r.currentUser)}import{hasProfile as ns,registerProfile as ss}from"./core.mjs";function Vt(e){r.profile=e,!ns(e)&&!r.warnedProfiles[e]&&(r.warnedProfiles[e]=!0,typeof console<"u"&&console.warn&&console.warn('[stadiaref] no profile named "'+e+'" is registered yet. Using generic until it is.'))}function Eo(e){return ss(e),e.name===r.profile}import{validate as ls}from"./core.mjs";function ds(e){if(!e||typeof e!="object")return W;var t=Je(e);if("keys"in t&&Ye(t.keys),"theme"in t&&(t.theme==="auto"||t.theme==="light"||t.theme==="dark")&&Qr(t.theme),"mount"in t&&(r.mountSelector=typeof t.mount=="string"?t.mount:null),"dock"in t?Or(t.dock):"mount"in t&&B(),"dockOffset"in t&&(r.dockOffset=It(t.dockOffset),B()),"watch"in t&&(r.watch=!(t.watch===!1||t.watch==="0")),"click"in t&&us(t.click),"tree"in t&&dt(t.tree),"drill"in t&&(r.drillEnabled=!(t.drill===!1||t.drill==="0"),r.drillEnabled||Y()),"hint"in t&&(r.hintEnabled=!(t.hint===!1||t.hint==="0")),"user"in t&&Mr(t.user),"labels"in t&&Ie(t.labels),"outline"in t&&I(t.outline),"tiers"in t&&Be(t.tiers),"profile"in t&&Co(t.profile),"pageSlug"in t&&(r.config.pageSlug=t.pageSlug),"classConverter"in t&&(r.classConverterEnabled=t.classConverter===!0||t.classConverter==="1"),"autoAddress"in t||"autoRefDepth"in t){var a="autoAddress"in t?t.autoAddress===!0||t.autoAddress==="1":r.autoRefEnabled;$e(a?t.autoRefDepth||"all":"off")}else("pageSlug"in t||t.classConverter===!0||t.classConverter==="1")&&$t();return"startHidden"in t&&(t.startHidden===!1||t.startHidden==="0")&&ne(),W}function Co(e){if(typeof e!="string"||!e){typeof console<"u"&&console.warn&&console.warn("[stadiaref] setProfile expected a profile name, got",e);return}Vt(e),r.booted&&$t()}function fs(e){var t=Eo(e);return t&&r.booted&&$t(),e.name}function cs(e){e===!1?Se():mr()}function ps(e){return e===!1?(j(),[]):r.booted?Ae(typeof e=="string"?e:void 0):[]}function us(e){if(e!=="card"&&e!=="copy"){typeof console<"u"&&console.warn&&console.warn('[stadiaref] click expected "card" or "copy", got',e);return}r.clickMode=e,e==="copy"&&M()}function hs(e){return e===!1?(M(),!1):!r.booted||r.presentationMode?!1:(typeof e=="string"&&(e=So(e)),re(e,null,{focus:!0}))}function So(e){for(var t=document.querySelectorAll("[data-ref]"),a=0;a<t.length;a++)if(t[a].getAttribute("data-ref")===e)return t[a];return null}function gs(e){return e===!1?(Y(),!1):r.booted?(typeof e=="string"&&(e=So(e)),Ue(e)):!1}function bs(e){r.lookup=typeof e=="function"?e:null}function vs(e,t){r.onAddress=typeof e=="function"?{fn:e,label:typeof t=="string"&&t?t:"Send"}:null}function $t(){ie()}function E(e,t){return function(){return r.booted?e.apply(null,arguments):(r.queue.push([e,arguments]),t)}}var W={version:ee,ready:null,init:null,show:E(ne),hide:E(We),toggle:E(At),isVisible:function(){return r.presentationMode===!1},refresh:E($t),setLabels:E(Ie),getLabels:qe,setTiers:E(Be),getTiers:X,setAutoAddress:E(Ka),getAutoAddress:ja,setOutline:E(I),getOutline:function(){return r.outlineMode},toggleTree:E(H),card:hs,setLookup:bs,onAddress:vs,getClick:function(){return r.clickMode},getTreeWidth:function(){return r.treeWidth},drill:gs,getDrill:function(){return r.drillRoot?r.drillRoot.getAttribute("data-ref"):null},pick:E(cs),find:ps,setTheme:E(Qr),getTheme:Ao,setDock:E(Or),getDock:function(){return r.position},setKeys:E(Ye),getKeys:io,setUser:E(Mr),getUser:Dr,setProfile:Co,getProfile:function(){return r.profile},registerProfile:fs,classify:Wr,validate:function(e){return ls(e,{profile:it()})}};W.init=E(ds,W);var Fo=".stadiaref-ref-icon, .stadiaref-ref-tooltip, .stadiaref-ref-full-label, .stadiaref-ref-link, .stadiaref-cluster-badge, .stadiaref-block-group-badge, .stadiaref-outline",To=`
/* --- The layer and the slots (layer.js) --- */
.stadiaref-layer { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: visible; pointer-events: none; z-index: 1; }
.stadiaref-slot { position: absolute; top: 0; left: 0; pointer-events: none; }
/* Scrolled out of its container (layer.js), or its element is covered. */
.stadiaref-slot[data-clipped] { display: none; }
.stadiaref-slot[data-covered] > :not(.stadiaref-outline) { visibility: hidden !important; }

/* --- What is drawn --- */
LAYER:not([data-stadiaref-visible]) :is(${Fo}) { display: none !important; }
LAYER[data-stadiaref-labels="off"] :is(.stadiaref-ref-icon, .stadiaref-ref-tooltip, .stadiaref-ref-full-label, .stadiaref-ref-link, .stadiaref-cluster-badge, .stadiaref-block-group-badge) { display: none !important; }
LAYER[data-stadiaref-labels="full"] :is(.stadiaref-ref-icon, .stadiaref-ref-tooltip) { display: none !important; }
LAYER:not([data-stadiaref-labels="full"]) .stadiaref-ref-full-label { display: none !important; }
LAYER[data-stadiaref-hidden-tiers~="section"] .stadiaref-tier-section,
LAYER[data-stadiaref-hidden-tiers~="block"] .stadiaref-tier-block,
LAYER[data-stadiaref-hidden-tiers~="element"] .stadiaref-tier-element,
LAYER[data-stadiaref-hidden-tiers] .stadiaref-tier-unclassified { display: none !important; }
.stadiaref-ref-hidden, .stadiaref-ref-clustered, .stadiaref-collapsed { display: none !important; }
/* Outside the open host dialog (dialogs.js). */
.stadiaref-ref-outside { display: none !important; }
.stadiaref-ref-outside-drill { display: none !important; }
/* Labels step aside while Pick is on */
LAYER[data-stadiaref-mode="pick"] :is(${Fo}) { display: none !important; }

/* --- Full label: a tier tag and the address --- */
.stadiaref-ref-full-label {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 2px;
  left: 2px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  width: max-content;
  max-width: 280px;
  padding: 2px 5px;
  border: 1px solid transparent;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  font-family: ${k};
  font-size: 10px;
  line-height: 1.3;
  white-space: nowrap;
  z-index: 90;
  cursor: pointer;
  pointer-events: none;
  user-select: none;
}
.stadiaref-ref-tag {
  all: initial;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
  flex-shrink: 0;
}
.stadiaref-ref-address {
  all: initial;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Section: solid lime, black text, edged in Lime Ink */
.stadiaref-ref-full-label.stadiaref-tier-section.stadiaref-on-light { background: #A3E635; color: #000000; border-color: #3F6212; }
.stadiaref-ref-full-label.stadiaref-tier-section.stadiaref-on-dark { background: #BEF264; color: #000000; border-color: #BEF264; }
.stadiaref-ref-full-label.stadiaref-tier-section:hover { background: #111827; color: #FFFFFF; border-color: #111827; }
/* Block: dark */
.stadiaref-ref-full-label.stadiaref-tier-block.stadiaref-on-light { background: rgba(17, 24, 39, 0.92); color: #F7FEE7; border-color: rgba(17, 24, 39, 0.92); }
.stadiaref-ref-full-label.stadiaref-tier-block.stadiaref-on-dark { background: rgba(255, 255, 255, 0.92); color: #111827; border-color: rgba(255, 255, 255, 0.92); }
/* Element: light, with a border */
.stadiaref-ref-full-label.stadiaref-tier-element.stadiaref-on-light { background: #FFFFFF; color: #111827; border-color: #6B7280; }
.stadiaref-ref-full-label.stadiaref-tier-element.stadiaref-on-dark { background: rgba(17, 24, 39, 0.72); color: #FFFFFF; border-color: rgba(255, 255, 255, 0.6); }
.stadiaref-ref-full-label.stadiaref-tier-block:hover,
.stadiaref-ref-full-label.stadiaref-tier-element:hover { background: #A3E635; color: #000000; border-color: #3F6212; }
/* Unclassified: dashed amber, no shadow */
.stadiaref-ref-full-label.stadiaref-tier-unclassified { box-shadow: none; border-style: dashed; }
.stadiaref-ref-full-label.stadiaref-tier-unclassified.stadiaref-on-light { background: #FFFBEB; color: #92400E; border-color: #B45309; }
.stadiaref-ref-full-label.stadiaref-tier-unclassified.stadiaref-on-dark { background: rgba(17, 24, 39, 0.72); color: #FDE68A; border-color: #FBBF24; }
.stadiaref-ref-full-label.stadiaref-tier-unclassified:hover { background: #92400E; color: #FFFFFF; border-color: #92400E; border-style: solid; }
/* Automatic address: the tier's colours with a dashed border. Where the
   tier's border matches its background, the dash takes the text colour. */
.stadiaref-ref-full-label.stadiaref-auto { border-style: dashed; }
.stadiaref-ref-full-label.stadiaref-auto.stadiaref-tier-section,
.stadiaref-ref-full-label.stadiaref-auto.stadiaref-tier-block { border-color: currentColor; }

/* --- Icons mode: a 16px dot carrying the tier's letter --- */
.stadiaref-ref-icon {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border: 1px solid transparent;
  border-radius: 50%;
  font-family: ${k};
  font-size: 9px;
  font-weight: 700;
  line-height: 14px;
  text-align: center;
  z-index: 90;
  cursor: pointer;
  pointer-events: none;
  user-select: none;
}
.stadiaref-ref-icon.stadiaref-tier-section.stadiaref-on-light { background: #A3E635; color: #000000; border-color: #3F6212; }
.stadiaref-ref-icon.stadiaref-tier-section.stadiaref-on-dark { background: #BEF264; color: #000000; border-color: #BEF264; }
.stadiaref-ref-icon.stadiaref-tier-block.stadiaref-on-light { background: #111827; color: #F7FEE7; border-color: #111827; }
.stadiaref-ref-icon.stadiaref-tier-block.stadiaref-on-dark { background: #FFFFFF; color: #111827; border-color: #FFFFFF; }
.stadiaref-ref-icon.stadiaref-tier-element.stadiaref-on-light { background: #FFFFFF; color: #111827; border-color: #6B7280; }
.stadiaref-ref-icon.stadiaref-tier-element.stadiaref-on-dark { background: #111827; color: #FFFFFF; border-color: rgba(255, 255, 255, 0.6); }
.stadiaref-ref-icon.stadiaref-tier-unclassified { border-style: dashed; }
.stadiaref-ref-icon.stadiaref-tier-unclassified.stadiaref-on-light { background: #FFFBEB; color: #92400E; border-color: #B45309; }
.stadiaref-ref-icon.stadiaref-tier-unclassified.stadiaref-on-dark { background: #111827; color: #FDE68A; border-color: #FBBF24; }
.stadiaref-ref-icon.stadiaref-auto { border-style: dashed; }
.stadiaref-ref-icon.stadiaref-auto.stadiaref-tier-section,
.stadiaref-ref-icon.stadiaref-auto.stadiaref-tier-block { border-color: currentColor; }
.stadiaref-ref-icon:hover { box-shadow: 0 0 0 2px rgba(63, 98, 18, 0.45); }

/* The address beside a dot, on hover or keyboard focus. */
.stadiaref-ref-tooltip {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 2px;
  left: 22px;
  padding: 4px 7px;
  background: rgba(17, 24, 39, 0.92);
  color: #F7FEE7;
  border-radius: 3px;
  font-family: ${k};
  font-size: 10px;
  line-height: 1;
  white-space: nowrap;
  z-index: 91;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.1s, transform 0.1s;
  cursor: pointer;
  pointer-events: none;
  user-select: none;
}
.stadiaref-ref-icon:hover + .stadiaref-ref-tooltip,
.stadiaref-ref-icon:focus-visible + .stadiaref-ref-tooltip,
.stadiaref-ref-tooltip:hover {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

/* Labels only take the pointer once StadiaRef knows they are visible. */
.stadiaref-ref-icon.stadiaref-visible-host,
.stadiaref-ref-full-label.stadiaref-visible-host { pointer-events: auto; }

/* --- Stagger leader line --- */
.stadiaref-ref-link {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 2px;
  left: 9px;
  width: 1px;
  height: 0;
  background: #3F6212;
  z-index: 89;
  pointer-events: none;
  opacity: 0;
}
.stadiaref-ref-link.stadiaref-on-dark { background: #BEF264; }

/* --- Void elements: labels mount in a host over the element's box --- */

/* --- Outline guides: StadiaRef's own frame inside the element --- */
.stadiaref-outline {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: 88;
}
.stadiaref-outline--section { border: 2px solid rgba(63, 98, 18, 0.9); box-shadow: inset 0 0 0 1px rgba(163, 230, 53, 0.6), inset 0 14px 0 0 rgba(163, 230, 53, 0.16); }
.stadiaref-outline--section.stadiaref-on-dark { border-color: rgba(190, 242, 100, 0.98); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14), inset 0 14px 0 0 rgba(190, 242, 100, 0.14); }
.stadiaref-outline--block { border: 1px dashed rgba(63, 98, 18, 0.6); box-shadow: inset 0 0 0 1px rgba(163, 230, 53, 0.2); }
.stadiaref-outline--block.stadiaref-on-dark { border-color: rgba(255, 255, 255, 0.36); box-shadow: inset 0 0 0 1px rgba(190, 242, 100, 0.16); }

/* --- "+N" cluster badge and its list --- */
.stadiaref-cluster-badge {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  padding: 2px 6px;
  background: #ECFCCB;
  color: #3F6212;
  border: 1px solid rgba(63, 98, 18, 0.5);
  border-radius: 10px;
  font-family: ${k};
  font-size: 10px;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
  z-index: 92;
  pointer-events: auto;
  user-select: none;
}
.stadiaref-cluster-badge.stadiaref-on-dark { background: #27272A; color: #A3E635; border-color: rgba(163, 230, 53, 0.5); }
.stadiaref-cluster-badge:hover { background: #A3E635; color: #000000; border-color: #3F6212; }

/* --- "+N blocks" block group badge and its list --- */
.stadiaref-block-group-badge {
  all: initial;
  box-sizing: border-box;
  position: absolute;
  padding: 3px 7px;
  background: #ECFCCB;
  color: #3F6212;
  border-radius: 999px;
  font-family: ${k};
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  z-index: 92;
  pointer-events: auto;
  user-select: none;
}
.stadiaref-block-group-badge.stadiaref-on-dark { background: #27272A; color: #A3E635; }

.stadiaref-cluster-popover,
.stadiaref-block-group-popover {
  all: initial;
  box-sizing: border-box;
  display: none;
  flex-direction: column;
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 180px;
  max-width: 320px;
  padding: 4px;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
  z-index: 93;
  pointer-events: auto;
}
.stadiaref-cluster-badge:hover > .stadiaref-cluster-popover,
.stadiaref-cluster-popover:hover,
.stadiaref-block-group-badge:hover > .stadiaref-block-group-popover,
.stadiaref-block-group-popover:hover { display: flex; }
.stadiaref-cluster-item,
.stadiaref-block-group-item {
  all: initial;
  box-sizing: border-box;
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 3px;
  font-family: ${k};
  font-size: 10px;
  line-height: 1.3;
  color: #F7FEE7;
  white-space: nowrap;
  cursor: pointer;
}
.stadiaref-cluster-item:hover,
.stadiaref-block-group-item:hover { background: #A3E635; color: #000000; }
.stadiaref-cluster-item-tag,
.stadiaref-block-group-item-type {
  all: initial;
  font-family: inherit;
  font-size: inherit;
  font-weight: 700;
  color: #D1D5DB;
  flex-shrink: 0;
}
.stadiaref-cluster-item:hover .stadiaref-cluster-item-tag,
.stadiaref-block-group-item:hover .stadiaref-block-group-item-type { color: inherit; }
.stadiaref-cluster-item-ref,
.stadiaref-block-group-item-ref {
  all: initial;
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
`.replace(/LAYER/g,".stadiaref-layer");function Oo(e){return Object.keys(e).map(function(t){return"--sr-"+t+": "+e[t]+";"}).join(" ")}function ms(){return Object.keys(Qe).map(function(e){var t=Qe[e];return".stadiaref-tag--"+e+" { background: "+t.bg+"; color: "+t.fg+"; border-color: "+t.bd+"; }"}).join(`
`)}function Bo(){return`
:host { ${Oo(Jt.light)} }
:host(.stadiaref-theme-dark) { ${Oo(Jt.dark)} }

/* --- The toolbar --- */
.stadiaref-toolbar {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  max-width: calc(100vw - 40px);
  padding: 4px;
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: ${R};
  font-size: 12px;
  line-height: 1.5;
  color: var(--sr-fg);
  pointer-events: auto;
  z-index: 3;
}
.stadiaref-toolbar *, .stadiaref-toolbar *::before, .stadiaref-toolbar *::after { box-sizing: border-box; }
.stadiaref-toolbar--inline { position: relative; max-width: 100%; box-shadow: none; }
.stadiaref-toolbar button {
  font-family: inherit;
  margin: 0;
}
:is(.stadiaref-toolbar, .stadiaref-tree-panel, .stadiaref-active-ref-tree) :is(a, button, [tabindex]):focus { outline: none; }
:is(.stadiaref-toolbar, .stadiaref-tree-panel, .stadiaref-active-ref-tree) :is(a, button, [tabindex]):focus-visible {
  outline: 2px solid var(--sr-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 2px var(--sr-focusHalo);
}

/* Brand: icon and logotype, always present */
.stadiaref-brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 0 8px 0 6px;
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--sr-fg);
  text-decoration: none;
}
.stadiaref-brand:hover { background: var(--sr-pillBg); border-color: var(--sr-barBd); }
.stadiaref-brand__icon { display: block; width: 20px; height: 20px; flex-shrink: 0; }
.stadiaref-brand__disc { fill: var(--sr-dot); }
.stadiaref-brand__logotype { display: block; width: 65px; height: 11px; flex-shrink: 0; }
.stadiaref-brand__stadia { fill: var(--sr-fg); }
.stadiaref-brand__ref { fill: var(--sr-refFg); }
.stadiaref-brand__tip {
  position: absolute;
  left: 0;
  bottom: calc(100% + 10px);
  padding: 5px 10px;
  background: var(--sr-tipBg);
  color: var(--sr-tipFg);
  border-radius: 4px;
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s;
}
:host([data-stadiaref-dock^="top"]) .stadiaref-brand__tip { bottom: auto; top: calc(100% + 10px); }
.stadiaref-brand:hover .stadiaref-brand__tip,
.stadiaref-brand:focus-visible .stadiaref-brand__tip { opacity: 1; }

/* Reviewer pill */
.stadiaref-toolbar__user {
  display: none;
  align-items: center;
  gap: 6px;
  padding: 4px 9px 4px 5px;
  background: var(--sr-pillBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 999px;
  white-space: nowrap;
}
.stadiaref-toolbar__user--visible { display: inline-flex; }
.stadiaref-toolbar__user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--sr-avatarBg);
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 700;
}
.stadiaref-toolbar__user-name { font-weight: 600; }
.stadiaref-toolbar__user-role { font-size: 10px; color: var(--sr-key); }

/* Groups: the primary controls, a divider, then Outline and Tree */
.stadiaref-toolbar__cluster { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.stadiaref-toolbar__cluster--primary { padding-right: 6px; margin-right: 2px; border-right: 1px solid var(--sr-barBd); }
.stadiaref-toolbar__group { position: relative; display: flex; }

/* Controls: pills with a 10px uppercase key and a 12px value */
.stadiaref-toolbar__select {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 4px 10px;
  background: var(--sr-pillBg);
  border: 1px solid transparent;
  border-radius: 999px;
  color: var(--sr-fg);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  cursor: pointer;
}
.stadiaref-toolbar__select:hover { border-color: var(--sr-barBd); }
.stadiaref-toolbar__key {
  font-size: 10px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  color: var(--sr-key);
}
.stadiaref-toolbar__key--short { display: none; }
.stadiaref-toolbar__caret { font-size: 8px; color: var(--sr-key); }
.stadiaref-toolbar__select svg { display: block; flex-shrink: 0; }
.stadiaref-toolbar__select--active,
.stadiaref-toolbar__select[aria-pressed="true"] {
  background: var(--sr-wash);
  border-color: var(--sr-washBd);
  color: var(--sr-accent);
}
.stadiaref-toolbar__select--active .stadiaref-toolbar__key,
.stadiaref-toolbar__select--active .stadiaref-toolbar__caret { color: var(--sr-accent); }
.stadiaref-toolbar__select--open {
  background: var(--sr-barBg);
  border-color: var(--sr-ring);
  box-shadow: 0 0 0 3px var(--sr-ringGlow);
  color: var(--sr-fg);
}
.stadiaref-toolbar__select--open .stadiaref-toolbar__key,
.stadiaref-toolbar__select--open .stadiaref-toolbar__caret { color: var(--sr-key); }
/* Utility controls (Outline, Tree): quieter, with a state dot */
.stadiaref-toolbar__select--utility { background: transparent; color: var(--sr-util); }
.stadiaref-toolbar__select--utility.stadiaref-toolbar__select--active,
.stadiaref-toolbar__select--utility[aria-pressed="true"] { background: var(--sr-diagBg); border-color: var(--sr-washBd); color: var(--sr-fg); }
.stadiaref-toolbar__select--utility .stadiaref-toolbar__key { color: var(--sr-key); }
.stadiaref-toolbar__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sr-dotOff); flex-shrink: 0; }
.stadiaref-toolbar__select--active .stadiaref-toolbar__dot,
.stadiaref-toolbar__select[aria-pressed="true"] .stadiaref-toolbar__dot { background: var(--sr-dot); box-shadow: 0 0 0 1px var(--sr-dotRing); }

/* AUTO chip: a status, not a button. Present only while auto-address is on */
.stadiaref-toolbar__auto {
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  border: 1px dashed var(--sr-autoBd);
  border-radius: 3px;
  color: var(--sr-autoFg);
  font-family: ${k};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  white-space: nowrap;
}
.stadiaref-toolbar__auto[hidden] { display: none; }

/* Menus */
.stadiaref-toolbar__dropdown {
  display: none;
  position: absolute;
  min-width: 250px;
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  z-index: 2;
}
.stadiaref-toolbar__dropdown[data-stadiaref-menu="show"] { min-width: 290px; }
.stadiaref-toolbar__dropdown--open { display: block; }
.stadiaref-toolbar__hint {
  display: block;
  padding: 6px 12px;
  font-size: 10px;
  color: var(--sr-key);
  border-bottom: 1px solid var(--sr-barBd);
}
.stadiaref-toolbar__hint[hidden] { display: none; }
.stadiaref-toolbar__option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 7px 12px;
  border: 0;
  background: transparent;
  color: var(--sr-fg);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
}
.stadiaref-toolbar__option:hover { background: var(--sr-hover); }
.stadiaref-toolbar__option-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.stadiaref-toolbar__note { font-weight: 400; color: var(--sr-desc); }
.stadiaref-toolbar__option--active { background: var(--sr-wash); color: var(--sr-accent); font-weight: 600; }
.stadiaref-toolbar__option--active .stadiaref-toolbar__note { color: var(--sr-accent); }
.stadiaref-toolbar__option--active:hover { background: var(--sr-wash); }
/* Show rows: a tick box per tier; the rows don't take the wash */
.stadiaref-toolbar__check.stadiaref-toolbar__option--active { background: transparent; color: var(--sr-fg); }
.stadiaref-toolbar__check.stadiaref-toolbar__option--active:hover { background: var(--sr-hover); }
.stadiaref-toolbar__check.stadiaref-toolbar__option--active .stadiaref-toolbar__note { color: var(--sr-desc); }
.stadiaref-toolbar__tick {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: 1px solid var(--sr-tickOffBd);
  border-radius: 3px;
  background: var(--sr-tickOffBg);
  color: transparent;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}
.stadiaref-toolbar__check[aria-checked="true"] .stadiaref-toolbar__tick { border-color: var(--sr-tickOnBd); background: var(--sr-tickOnBg); color: var(--sr-tickOnFg); }

/* --- Compact: under 480px, or a coarse pointer --- */
@media (max-width: 479px), (pointer: coarse) {
  .stadiaref-toolbar__select, .stadiaref-brand, .stadiaref-toolbar__option { min-height: 44px; }
  .stadiaref-toolbar__select { padding-top: 12px; padding-bottom: 12px; }
  .stadiaref-toolbar__key--long { display: none; }
  .stadiaref-toolbar__key--short { display: inline; }
}
@media (max-width: 479px) {
  .stadiaref-brand__logotype { display: none; }
  .stadiaref-toolbar__dropdown { min-width: min(290px, calc(100vw - 40px)); }
}

/* --- Toast --- */
.stadiaref-toast {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  max-width: calc(100vw - 40px);
  padding: 7px 11px;
  background: var(--sr-toastBg);
  color: var(--sr-toastFg);
  border: 1px solid var(--sr-toastBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  font-family: ${k};
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s;
  pointer-events: none;
  z-index: 4;
}
.stadiaref-toast--visible { opacity: 1; transform: translateY(0); }

/* --- Panels: the Tree and the address chain --- */
.stadiaref-tree-panel, .stadiaref-active-ref-tree {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: none;
  flex-direction: column;
  width: 380px;
  max-width: calc(100vw - 40px);
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  font-family: ${R};
  font-size: 12px;
  line-height: 1.5;
  color: var(--sr-fg);
  pointer-events: auto;
  z-index: 2;
}
.stadiaref-tree-panel *, .stadiaref-active-ref-tree * { box-sizing: border-box; }
.stadiaref-tree-panel button, .stadiaref-active-ref-tree button { font-family: inherit; margin: 0; }
.stadiaref-tree-panel--open, .stadiaref-active-ref-tree--open { display: flex; }
.stadiaref-tree-panel { max-height: min(560px, calc(100vh - 120px)); }
.stadiaref-tree-panel--push { width: 360px; max-width: 100vw; max-height: none; border-width: 0 0 0 1px; border-radius: 0; box-shadow: none; }
.stadiaref-tree-panel__header { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px; border-bottom: 1px solid var(--sr-barBd); }
.stadiaref-tree-panel__header-main { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.stadiaref-tree-panel__title-wrap { display: flex; align-items: center; gap: 8px; }
.stadiaref-tree-panel__title { font-size: 12px; font-weight: 700; }
.stadiaref-tree-panel__count { padding: 1px 7px; border-radius: 999px; background: var(--sr-chipBg); color: var(--sr-chipFg); font-size: 11px; font-weight: 600; }
.stadiaref-tree-panel__close, .stadiaref-tree-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--sr-muted);
  cursor: pointer;
  flex-shrink: 0;
}
.stadiaref-tree-panel__close:hover { background: var(--sr-hover); }
.stadiaref-tree-panel__meta { display: flex; flex-wrap: wrap; gap: 6px; }
.stadiaref-tree-panel__meta-item {
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--sr-pillBg);
  border: 1px solid var(--sr-barBd);
  color: var(--sr-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}
.stadiaref-tree-panel__hint { font-size: 11px; color: var(--sr-muted); }
.stadiaref-tree-search { height: 28px; padding: 0 8px; border: 1px solid var(--sr-barBd); border-radius: 4px; background: var(--sr-barBg); color: var(--sr-fg); font-family: ${k}; font-size: 12px; outline: none; }
.stadiaref-tree-search:focus-visible { outline: 2px solid var(--sr-focus); outline-offset: 2px; box-shadow: 0 0 0 2px var(--sr-focusHalo); }
.stadiaref-tree-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px; }
.stadiaref-tree-tabs, .stadiaref-tree-filters { display: flex; flex-wrap: wrap; gap: 2px; }
.stadiaref-tree-filters[hidden] { display: none; }
.stadiaref-tree-tab, .stadiaref-tree-filter { min-height: 24px; padding: 0 8px; border: 1px solid transparent; border-radius: 4px; background: transparent; color: var(--sr-muted); font-size: 11px; font-weight: 600; cursor: pointer; }
.stadiaref-tree-tab:hover, .stadiaref-tree-filter:hover { background: var(--sr-hover); }
.stadiaref-tree-tab[aria-pressed="true"], .stadiaref-tree-filter[aria-pressed="true"] { background: var(--sr-wash); border-color: var(--sr-washBd); color: var(--sr-accent); }
.stadiaref-tree-problem { min-width: 28px; padding: 1px 4px; border: 1px dashed var(--sr-warnFg); border-radius: 3px; color: var(--sr-warnFg); font-family: ${k}; font-size: 9px; font-weight: 700; text-align: center; flex-shrink: 0; }
@media (pointer: coarse) { .stadiaref-tree-tab, .stadiaref-tree-filter, .stadiaref-tree-search { min-height: 44px; } }
.stadiaref-tree-panel__body { display: flex; flex-direction: column; padding: 4px 0; overflow-y: auto; }
.stadiaref-tree-empty { padding: 12px; color: var(--sr-muted); }
.stadiaref-tree-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-height: 29px;
  padding: 0 8px 0 12px;
  cursor: pointer;
}
.stadiaref-tree-row--active { background: var(--sr-rowHover); }
.stadiaref-tree-row--active .stadiaref-tree-ref { font-weight: 700; color: var(--sr-rowHoverFg); }
.stadiaref-tree-row--active .stadiaref-tree-copy { background: var(--sr-barBg); color: var(--sr-accent); }
.stadiaref-tree-ref {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--sr-fg);
  font-family: ${k};
  font-size: 11px;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

/* Tier tags in the Tree and the chain */
.stadiaref-tag {
  min-width: 28px;
  padding: 1px 4px;
  border: 1px solid transparent;
  border-radius: 3px;
  font-family: ${k};
  font-size: 9px;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;
  flex-shrink: 0;
}
${ms()}
.stadiaref-tag--auto { border-style: dashed; }

.stadiaref-active-ref-tree { width: 340px; }
.stadiaref-active-ref-tree__header { display: flex; align-items: center; justify-content: space-between; padding: 8px 8px 8px 12px; border-bottom: 1px solid var(--sr-barBd); }
.stadiaref-active-ref-tree__title { font-size: 10px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: var(--sr-muted); }
.stadiaref-active-ref-tree__pin {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border: 1px solid var(--sr-barBd);
  border-radius: 4px;
  background: transparent;
  color: var(--sr-muted);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}
.stadiaref-active-ref-tree__pin[aria-pressed="true"] { border-color: var(--sr-pinOnBd); background: var(--sr-pinOnBg); color: var(--sr-pinOnFg); }
.stadiaref-active-ref-tree__row {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 12px;
  border: 0;
  background: transparent;
  color: var(--sr-fg);
  font-family: ${k};
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}
.stadiaref-active-ref-tree__row:hover { background: var(--sr-hover); }
.stadiaref-active-ref-tree__row--current { background: var(--sr-rowHover); color: var(--sr-rowHoverFg); font-weight: 700; }
.stadiaref-active-ref-tree__row-ref { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* --- Highlights over page elements (highlight.js) --- */
.stadiaref-highlight {
  all: initial;
  position: fixed;
  box-sizing: border-box;
  pointer-events: none;
  z-index: 1;
  border-radius: 2px;
}
.stadiaref-highlight[hidden] { display: none; }
/* Frames are a lime band edged in Lime Ink: the ink carries it on light
   pages, the lime on dark ones (lime alone is 1.4:1 on white). */
.stadiaref-highlight--hover { outline: 2px solid #3F6212; outline-offset: 3px; box-shadow: 0 0 0 3px #A3E635; }
.stadiaref-highlight--jump { outline: 3px solid #3F6212; outline-offset: 4px; box-shadow: 0 0 0 4px #A3E635; }
/* Pick: the chosen level solid, the rest of its chain dashed */
.stadiaref-highlight--pick-current { outline: 2px solid #3F6212; outline-offset: 2px; box-shadow: 0 0 0 2px #A3E635; }
[class*="stadiaref-highlight--pick-"]:not(.stadiaref-highlight--pick-current) { outline: 1px dashed #3F6212; outline-offset: 4px; box-shadow: 0 0 0 4px rgba(163, 230, 53, 0.35); }
/* Find: the match framed, the rest of the page dimmed by this one layer */
.stadiaref-highlight--card { outline: 2px solid #3F6212; outline-offset: 2px; box-shadow: 0 0 0 2px #A3E635; }
.stadiaref-highlight--drill { outline: 2px dashed #3F6212; outline-offset: 4px; box-shadow: 0 0 0 100vmax rgba(17, 24, 39, 0.35); }
.stadiaref-highlight--find { outline: 2px solid #3F6212; outline-offset: 6px; box-shadow: 0 0 0 6px #A3E635, 0 0 0 100vmax rgba(17, 24, 39, 0.45); }

/* --- Dialog status line --- */
.stadiaref-dialog-status {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  max-width: calc(100vw - 40px);
  padding: 7px 11px;
  background: var(--sr-statusBg);
  color: var(--sr-statusFg);
  border: 1px solid var(--sr-toastBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  font-family: ${R};
  font-size: 12px;
  line-height: 1.4;
  pointer-events: none;
  z-index: 4;
}
.stadiaref-dialog-status[hidden] { display: none; }

/* --- Pick sheet (touch) --- */
.stadiaref-pick-sheet {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  left: calc(12px + env(safe-area-inset-left, 0px));
  right: calc(12px + env(safe-area-inset-right, 0px));
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: #111827;
  color: #F9FAFB;
  border-radius: 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
  font-family: ${R};
  pointer-events: auto;
  z-index: 6;
  animation: stadiaref-sheet-in 0.18s ease-out;
}
.stadiaref-pick-sheet[hidden] { display: none; }
@keyframes stadiaref-sheet-in { from { transform: translateY(16px); opacity: 0; } to { transform: none; opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .stadiaref-pick-sheet { animation: none; } }
.stadiaref-pick-sheet .stadiaref-pick-chip__parts { font-family: ${k}; font-size: 12px; }
.stadiaref-pick-sheet__address { font-family: ${k}; font-size: 12px; color: #E5E7EB; overflow-wrap: anywhere; }
.stadiaref-pick-sheet__actions { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 8px; }
.stadiaref-pick-sheet__btn {
  all: initial;
  box-sizing: border-box;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #6B7280;
  border-radius: 8px;
  color: #F9FAFB;
  font-family: ${R};
  font-size: 14px;
  cursor: pointer;
}
.stadiaref-pick-sheet__btn--copy { border-color: #A3E635; background: #A3E635; color: #000000; font-weight: 700; }
.stadiaref-pick-sheet__btn:focus-visible { outline: 2px solid #00C0F3; outline-offset: 2px; box-shadow: 0 0 0 2px #000000; }
.stadiaref-pick-sheet__btn[disabled] { opacity: 0.5; cursor: default; }

/* --- Pick chip --- */
.stadiaref-pick-chip {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: calc(100vw - 16px);
  padding: 7px 9px;
  background: #111827;
  color: #F9FAFB;
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  font-family: ${k};
  font-size: 11px;
  line-height: 1.3;
  pointer-events: none;
  z-index: 5;
}
.stadiaref-pick-chip[hidden] { display: none; }
.stadiaref-pick-chip__parts { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.stadiaref-pick-chip__sep { color: #9CA3AF; }
.stadiaref-pick-chip__part { padding: 1px 5px; border: 1px solid transparent; border-radius: 3px; font-weight: 700; white-space: nowrap; }
.stadiaref-pick-chip__part--section { background: #A3E635; color: #000000; border-color: #A3E635; }
.stadiaref-pick-chip__part--block { background: rgba(255, 255, 255, 0.92); color: #111827; border-color: rgba(255, 255, 255, 0.92); }
.stadiaref-pick-chip__part--element { border-color: rgba(255, 255, 255, 0.7); color: #FFFFFF; }
.stadiaref-pick-chip__part--unclassified { border-color: #FBBF24; border-style: dashed; color: #FDE68A; }
.stadiaref-pick-chip__part--current { box-shadow: 0 0 0 2px #111827, 0 0 0 4px #A3E635; }
.stadiaref-pick-chip__hint { font-family: ${R}; font-size: 11px; color: #D1D5DB; white-space: normal; max-width: 420px; }

/* --- Find --- */
.stadiaref-find {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: none;
  flex-direction: column;
  width: 400px;
  max-width: calc(100vw - 40px);
  max-height: min(480px, calc(100vh - 120px));
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  font-family: ${R};
  font-size: 12px;
  color: var(--sr-fg);
  pointer-events: auto;
  z-index: 3;
}
.stadiaref-find * { box-sizing: border-box; }
.stadiaref-find--open { display: flex; }
.stadiaref-find__label { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; font-size: 11px; font-weight: 600; color: var(--sr-muted); border-bottom: 1px solid var(--sr-barBd); }
.stadiaref-find__input {
  height: 32px;
  padding: 0 10px;
  border: 2px solid var(--sr-accent);
  border-radius: 4px;
  background: var(--sr-barBg);
  color: var(--sr-fg);
  font-family: ${k};
  font-size: 12px;
  outline: none;
}
.stadiaref-find__input:focus-visible { outline: 2px solid var(--sr-focus); outline-offset: 2px; box-shadow: 0 0 0 2px var(--sr-focusHalo); }
.stadiaref-find__list { display: flex; flex-direction: column; overflow-y: auto; }
.stadiaref-find__row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 6px 12px;
  border: 0;
  background: transparent;
  color: var(--sr-fg);
  font-family: ${k};
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}
.stadiaref-find__row:hover, .stadiaref-find__row[aria-selected="true"] { background: var(--sr-rowHover); color: var(--sr-rowHoverFg); }
.stadiaref-find__row[aria-selected="true"] { font-weight: 700; }
.stadiaref-find__row[aria-disabled="true"] { cursor: default; color: var(--sr-muted); background: transparent; }
.stadiaref-find__address { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stadiaref-find__note { margin-left: auto; padding: 0 6px; border-radius: 999px; background: var(--sr-chipBg); color: var(--sr-chipFg); font-family: ${R}; font-size: 10px; font-weight: 600; }
.stadiaref-find__status { padding: 7px 12px; border-top: 1px solid var(--sr-barBd); font-size: 11px; color: var(--sr-muted); }
@media (max-width: 479px), (pointer: coarse) { .stadiaref-find__row { min-height: 44px; } .stadiaref-find__input { height: 44px; } }
/* --- Drill-down breadcrumb --- */
.stadiaref-drill {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  top: calc(12px + env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  max-width: calc(100vw - 24px);
  padding: 4px 6px;
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  font-family: ${k};
  font-size: 11px;
  color: var(--sr-fg);
  pointer-events: auto;
  z-index: 6;
}
.stadiaref-drill[hidden] { display: none; }
.stadiaref-drill__sep { color: var(--sr-muted); }
.stadiaref-drill__crumb { all: initial; box-sizing: border-box; min-height: 24px; padding: 0 6px; border-radius: 4px; color: var(--sr-fg); font-family: inherit; font-size: 11px; cursor: pointer; }
.stadiaref-drill__crumb:hover { background: var(--sr-hover); }
.stadiaref-drill__crumb[aria-current="true"] { background: var(--sr-wash); color: var(--sr-accent); font-weight: 700; }
.stadiaref-drill__crumb:focus-visible { outline: 2px solid var(--sr-focus); outline-offset: 2px; box-shadow: 0 0 0 2px var(--sr-focusHalo); }
@media (pointer: coarse) { .stadiaref-drill__crumb { min-height: 44px; } }

/* --- Hover hint (labels off) --- */
.stadiaref-hint {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: calc(100vw - 16px);
  padding: 4px 8px 4px 4px;
  background: #111827;
  color: #FFFFFF;
  border-radius: 5px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
  font-family: ${k};
  font-size: 11px;
  line-height: 1.3;
  pointer-events: none;
  z-index: 5;
}
.stadiaref-hint[hidden] { display: none; }
.stadiaref-hint__address { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; }
.stadiaref-hint__tier { color: #D1D5DB; font-family: ${R}; }

/* --- The address card --- */
.stadiaref-card {
  all: initial;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 340px;
  max-width: calc(100vw - 16px);
  max-height: calc(100vh - 16px);
  overflow-y: auto;
  padding: 10px 12px 12px;
  background: var(--sr-barBg);
  border: 1px solid var(--sr-barBd);
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08);
  font-family: ${R};
  font-size: 12px;
  line-height: 1.45;
  color: var(--sr-fg);
  pointer-events: auto;
  z-index: 7;
}
.stadiaref-card[hidden] { display: none; }
.stadiaref-card * { box-sizing: border-box; }
.stadiaref-card:focus { outline: none; }
.stadiaref-card :is(button, a):focus { outline: none; }
.stadiaref-card :is(button, a):focus-visible { outline: 2px solid var(--sr-focus); outline-offset: 2px; box-shadow: 0 0 0 2px var(--sr-focusHalo); }
.stadiaref-card__head { display: flex; align-items: center; gap: 8px; }
.stadiaref-card__tier { flex: 1; color: var(--sr-muted); font-size: 11px; }
.stadiaref-card__address { font-family: ${k}; font-size: 15px; font-weight: 700; overflow-wrap: anywhere; }
.stadiaref-card__text { color: var(--sr-muted); overflow-wrap: anywhere; }
.stadiaref-card__rows { display: flex; flex-direction: column; gap: 2px; padding: 6px 0; border-top: 1px solid var(--sr-barBd); border-bottom: 1px solid var(--sr-barBd); }
.stadiaref-card__rows[hidden] { display: none; }
.stadiaref-card__row { display: flex; gap: 8px; }
.stadiaref-card__row-label { flex: 0 0 96px; color: var(--sr-muted); font-size: 11px; }
.stadiaref-card__row-value { flex: 1; min-width: 0; overflow-wrap: anywhere; color: var(--sr-fg); font-weight: 600; }
a.stadiaref-card__row-value { color: var(--sr-accent); }
.stadiaref-card__row--ok .stadiaref-card__row-value { color: var(--sr-okFg); }
.stadiaref-card__row--warn .stadiaref-card__row-value { color: var(--sr-warnFg); }
.stadiaref-card__row--error .stadiaref-card__row-value { color: var(--sr-errorFg); }
.stadiaref-card__row--muted .stadiaref-card__row-value { color: var(--sr-muted); font-weight: 400; }
.stadiaref-card__section { display: flex; flex-direction: column; gap: 4px; }
.stadiaref-card__key { font-size: 10px; font-weight: 700; letter-spacing: 0.4px; text-transform: uppercase; color: var(--sr-muted); }
.stadiaref-card__refs { display: flex; flex-wrap: wrap; gap: 4px; }
.stadiaref-card__ref { all: initial; box-sizing: border-box; display: inline-flex; align-items: center; gap: 5px; max-width: 100%; min-height: 24px; padding: 2px 6px 2px 3px; border: 1px solid var(--sr-barBd); border-radius: 4px; background: var(--sr-pillBg); color: var(--sr-fg); font-family: ${k}; font-size: 11px; cursor: pointer; }
.stadiaref-card__ref:hover { background: var(--sr-rowHover); color: var(--sr-rowHoverFg); }
.stadiaref-card__ref-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.stadiaref-card__more { align-self: center; color: var(--sr-muted); font-size: 11px; }
.stadiaref-card__actions { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 2px; }
.stadiaref-card__btn { all: initial; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; min-height: 30px; padding: 0 10px; border: 1px solid var(--sr-barBd); border-radius: 6px; background: var(--sr-barBg); color: var(--sr-fg); font-family: ${R}; font-size: 12px; font-weight: 600; cursor: pointer; }
.stadiaref-card__btn:hover { background: var(--sr-hover); }
.stadiaref-card__btn[disabled] { opacity: 0.5; cursor: default; }
.stadiaref-card__btn--copy { border-color: var(--sr-copyBd); background: var(--sr-copyBg); color: var(--sr-copyFg); }
.stadiaref-card__btn--copy:hover { background: var(--sr-copyBg); }
.stadiaref-card__btn--close { width: 26px; min-height: 26px; padding: 0; border-color: transparent; color: var(--sr-muted); }
@media (pointer: coarse) { .stadiaref-card__btn, .stadiaref-card__ref { min-height: 44px; } }
`}function Qo(){r.hostScriptEl=document.currentScript||null,r.config=wo(),vo(),Vt(typeof r.config.profile=="string"&&r.config.profile?r.config.profile:"generic"),r.state=Object.prototype.hasOwnProperty.call(ze,r.config.labels)?ze[r.config.labels]:2,r.classConverterEnabled=r.config.classConverter==="1"||r.config.classConverter===!0,r.clickMode=r.config.click==="copy"?"copy":"card",r.hintEnabled=!(r.config.hint===!1||r.config.hint==="0"),r.drillEnabled=!(r.config.drill===!1||r.config.drill==="0"),r.autoRefEnabled=r.config.autoAddress===!0||r.config.autoAddress==="1",r.autoRefDepth=r.config.autoRefDepth||"all",r.autoAddresses=new WeakMap,r.autoCounter=0,r.outlineMode=r.config.outline||"off",r.tiers=Cr(r.config.tiers)||{section:!0,block:!0,element:!0},r.presentationMode=!(r.config.startHidden==="0"||r.config.startHidden===!1),r.keys=qt(oo(),r.config.keys),r.theme=(function(){var t=r.config.theme;if(t==="light"||t==="dark"||t==="auto")return t;var a=ko();return a||"auto"})(),r.resolvedTheme="light",r.darkMediaQuery=null,r.currentUser=Wt(r.config.user),r._initialDock=typeof r.config.dock=="string"&&r.config.dock.toLowerCase()==="auto"?"auto":Fr(r.config.dock),r.position=r._initialDock==="auto"?"bottom-right":r._initialDock||"bottom-right",r.dockOffset=It(r.config.dockOffset),r.mountSelector=typeof r.config.mount=="string"?r.config.mount:null,r.watch=!(r.config.watch===!1||r.config.watch==="0"),r.shadowHost=document.createElement("div"),r.shadowHost.id="stadiaref-host",r.shadowHost.setAttribute("data-stadiaref-root",""),r.shadowHost.setAttribute("data-astro-transition-persist","stadiaref"),r.shadowHost.style.cssText="all:initial;position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:2147483646;pointer-events:none;",r.shadowCss=Bo()+To,r.shadowRoot=r.shadowHost.attachShadow({mode:"open"}),r.toolbar=document.createElement("div"),r.toolbar.className="stadiaref-toolbar",r.toolbar.setAttribute("role","toolbar"),r.toolbar.setAttribute("aria-label","StadiaRef"),r.toolbar.innerHTML=Ja(),r.toast=document.createElement("div"),r.toast.className="stadiaref-toast",r.toastTimer=null,r.visibilityRecheckScheduled=!1,r.treeOpen=!1,r.treeJumpTimer=null,r.treePanel=document.createElement("div"),r.treePanel.className="stadiaref-tree-panel",r.config.tree==="push"&&dt("push"),r.activeRefTreeOpen=!1,r.activeRefTreePinned=!1,r.activeRefTreeHideTimer=null,r.activeRefTree=document.createElement("div"),r.activeRefTree.className="stadiaref-active-ref-tree";var e=document.createElement("style");e.textContent=r.shadowCss,r.shadowRoot.appendChild(e),r.shadowRoot.appendChild(r.toolbar),r.shadowRoot.appendChild(r.toast),r.shadowRoot.appendChild(r.treePanel),r.shadowRoot.appendChild(r.activeRefTree),r.htmlClassObserver=null,document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ro):Ro()}function Ro(){var e=r.shadowRoot;r._initialDock==="auto"&&(r.position=Tr()),B(),Ze(),Rr(),Lo(),Pr(),Nt(),Ht(),Oe(),dr(r.state),r.outlineMode!=="off"&&I(r.outlineMode),Dt(),Te(),window.addEventListener("stadiaref:astro-app",Te),Lt(),h(r.toolbar.querySelectorAll("[data-stadiaref-toggle]"),function(s){s.addEventListener("click",function(l){l.stopPropagation(),Za(s.getAttribute("data-stadiaref-toggle"),l.detail===0)})}),h(r.toolbar.querySelectorAll("[data-stadiaref-state]"),function(s){s.addEventListener("click",function(){xe(parseInt(s.getAttribute("data-stadiaref-state"),10))})}),h(r.toolbar.querySelectorAll("[data-stadiaref-outline]"),function(s){s.addEventListener("click",function(){I(s.getAttribute("data-stadiaref-outline"))})}),h(r.toolbar.querySelectorAll("[data-stadiaref-tier]"),function(s){s.addEventListener("click",function(l){l.stopPropagation(),se(s.getAttribute("data-stadiaref-tier"))})}),h(r.toolbar.querySelectorAll("[data-stadiaref-pick], [data-stadiaref-find]"),function(s){s.addEventListener("click",function(l){l.stopPropagation();var d=s.hasAttribute("data-stadiaref-pick")?"pick":"find";r.keyActions&&r.keyActions[d]&&r.keyActions[d]()})}),eo(),r.showToolbar=ne,r.toggleTree=H,r.stopPick=Se,r.closeFind=j,r.keyActions={pick:wt,find:function(){we()?j():Ae()}},r.dismissChain=_t,r.applyDockPosition=B,r.drillInto=Ue,r.closeCard=M,r.showInTree=Xr,r.leaveMode=function(){return De()?(M(),!0):ke()?(Se(),!0):we()?(j(),!0):Oa()?(Y(),!0):!1};var t=r.toolbar.querySelector("[data-stadiaref-toggle-tree]");t&&t.addEventListener("click",function(s){s.stopPropagation(),H()}),e.addEventListener("click",function(s){!jt(s.target,"[data-stadiaref-toggle]")&&!jt(s.target,".stadiaref-toolbar__dropdown")&&q()}),document.addEventListener("click",function(s){V(s.target)||q()}),na(),Ca(),no(),window.addEventListener("stadiaref:address-hover",function(s){r.presentationMode||r.state===1||r.clickMode!=="copy"||Ra({dataRef:s.detail.address,element:s.detail.element})}),window.addEventListener("stadiaref:address-leave",function(){Qa()}),window.addEventListener("resize",function(){Jr(),b()&&B(),ve(),He(),C()}),document.addEventListener("toggle",function(){b()&&(ye(),ge())},!0),window.addEventListener("load",ge),r.placeHighlights=G,window.addEventListener("pointerdown",hr,!0),window.addEventListener("pointermove",hr,{capture:!0,passive:!0}),document.addEventListener("transitionend",function(s){(s.propertyName==="opacity"||s.propertyName==="visibility"||s.propertyName==="display")&&ut()},!0);function a(){if(b()){var s=!1;h(document.querySelectorAll("[data-ref]"),function(l){oe(l)||(s=!0)}),s&&ie()}}if(document.readyState==="complete"){var o=window.requestAnimationFrame||function(s){setTimeout(s,0)};o(a)}else window.addEventListener("load",a);r.booted=!0;var i=r.queue;r.queue=[];for(var n=0;n<i.length;n++)i[n][0].apply(null,i[n][1]);r.resolveReady&&r.resolveReady(),y("ready",{version:ee})}function xs(){return window.stadiaref&&typeof window.stadiaref=="object"&&window.stadiaref.version?"StadiaRef "+window.stadiaref.version:xo()?"Seguru Debug Toolbar 2.x":document.querySelector("[data-stadiaref-root]")?"StadiaRef":null}function Po(){if(!(typeof window>"u"||typeof document>"u")){var e=xs();return e?(typeof console<"u"&&console.warn&&console.warn("[stadiaref] "+e+" is already running on this page; this copy did not start."),window.stadiaref&&window.stadiaref.version?window.stadiaref:void 0):(W.ready=new Promise(function(t){r.resolveReady=function(){t(W)}}),mo(W,E),window.stadiaref=W,Qo(),W)}}var Vp=Po();export{Vp as default};
