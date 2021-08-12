# 01_3. [ARKET] 퍼블리싱가이드


Github URL
---
- ARKET :  https://github.com/idrpub/idr_arket_html.git


퍼블리싱 산출물 디렉토리
---
- node.js + express + ejs 환경
- 폴더구조
  
  /root
  
  ├ /dev : 신규 css를 위한 sass 폴더
  
  │　└ /css_dev
  
  ├ /dist : [official site] html 로 변환된 퍼블 산출물
  
  │　└ /ko

  ├ /dist-sis : [shop in shop(Use iFrame)] html 로 변환된 퍼블 산출물
  
  │　└ /ko
  
  ├ /dist-sis-con : [shop in shop(For iFrame)] html 로 변환된 퍼블 산출물
  
  │　└ /ko
  
  ├ /static : 퍼블 static 소스
  
  │　├ /css : 신규 css
  
  │　├ /fonts : 신규 font
  
  │　├ /js : 신규 images
  
  │　├ /js : 신규 js
  
  │　└ /org : 기존 사이트(글로벌사이트) static 소스
  
  ├ /views : ejs 관련 파일

  │　└ /common : page 별 include ejs 파일

  │　└ /handlebars : handlebars ejs 파일(ex. 레이어 팝업)
  
  │　└ /pages : page 별 ejs 파일
  
  ├ app.js : express 관련 파일
  
  ├ index.html : 퍼블 마크업 리스트 html
  
  └ package.json : node.js 관련 파일


지원브라우저
---
- 엣지, 크롬, 사파리, 오페라, 파이어폭스(최신버전기준)


퍼블리싱 작업 레퍼런스
---
- UI KIT
  https://www.arket.com/en/uikit/templates.html

- UI KIT (Components)
  https://www.arket.com/en/uikit/components.html

- UI KIT (Product Listings)
  https://www.arket.com/en/uikit/components/product-listings.html

- Appeaser
  https://p11-acc.ocd.ddns.net/pl