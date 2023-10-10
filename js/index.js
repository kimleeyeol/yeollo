(() => {

	let yOffset = 0; // window.pageYOffset 대신 쓸 변수
	let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
	let currentScene = 0; // 현재 활성화된(눈 앞에 보고있는) 씬(scroll-section)
	let enterNewScene = false; // 새로운 scene이 시작된 순간 true
	let acc = 0.2;
	let delayedYOffset = 0;
	let rafId;
	let rafState;

	const sceneInfo = [
		{
			// 0
			type: 'sticky',
			heightNum: 1, // 브라우저 높이의 5배로 scrollHeight 세팅
			scrollHeight: 0,
			objs: {
				container: document.querySelector('#scroll-section-0'),
			},
			values: {
				messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
			}
		},
		{
			// 1
			type: 'normal',
			heightNum: 1, // 브라우저 높이의 5배로 scrollHeight 세팅
			scrollHeight: 0,
			objs: {
				container: document.querySelector('#scroll-section-1'),
				content: document.querySelector('#scroll-section-1 .box-wrap'),
				textA : document.querySelector('#scroll-section-1 .rolling-txt1'),
				textB : document.querySelector('#scroll-section-1 .rolling-txt2'),
				projectA : document.querySelector('#scroll-section-1 .project-box'),
			},
			values: {
				textA_opacity_in: [0, 1, { start: 0, end: 0.2 }],
				textA_scale_in: [5, 1, { start: 0, end: 0.2 }],		
				textA_translateY_in: [0, -40, { start: 0, end: 0.2 }],
				projectA_opacity_in: [0, 1, { start: 0.2, end: 0.3 }],
				projectA_scaleY_in: [0, 100, { start: 0.2, end: 0.3 }],
				textB_opacity_in: [0, 1, { start: 0.4, end: 0.6 }],
				textB_translateY_in: [0, 40, { start: 0.4, end: 0.6 }],
			}
		},
		{
			// 2
			type: 'normal',
			heightNum: 1, // 브라우저 높이의 5배로 scrollHeight 세팅
			scrollHeight: 0,
			objs: {
				container: document.querySelector('#scroll-section-2'),
				content: document.querySelector('#scroll-section-2 .content-box'),
				about_textA : document.querySelector('#scroll-section-2 .section3-scene1 .about'),
				about_photo : document.querySelector('#scroll-section-2 .section3-scene1 .figure-wrap'),			

				work_photo1 : document.querySelector('.section3-scene2 .img-box1'),			
				work_photo2 : document.querySelector('.section3-scene2 .img-box2'),			
				work_photo3 : document.querySelector('.section3-scene2 .img-box3'),			
				work_photo4 : document.querySelector('.section3-scene2 .img-box4'),			
				work_textA : document.querySelector('.section3-scene2 .work'),

			},
			values: {
				about_textA_opacity: [0, 1, { start: 0, end: 0.05 }],
				about_textA_translateY: [0, 40, { start: 0, end: 0.05}],

				about_photo_opacity: [0, 1, { start: 0, end: 0.07 }],
				about_photo_translateY: [0, 40, { start: 0, end: 0.07}],

				work_photo_opacity: [0, 1, { start: 0.25, end: 0.35 }],
				work_photo2_opacity: [0, 1, { start: 0.29, end: 0.36 }],
				work_photo3_opacity: [0, 1, { start: 0.31, end: 0.37 }],
				work_photo4_opacity: [0, 1, { start: 0.34, end: 0.38 }],

				work_photo_translateX: [-40, 0, { start: 0.25, end: 0.35 }],
				work_photo2_translateX: [-40, 0, { start: 0.29, end: 0.36 }],
				work_photo3_translateX: [-40, 0, { start: 0.31, end: 0.37 }],
				work_photo4_translateX: [-40, 0, { start: 0.34, end: 0.38 }],
				
				work_textA_opacity: [0, 1, { start: 0.3, end: 0.45 }],
				work_textA_translateY: [40, 0, { start: 0.3, end: 0.4}],
			}
		},
		{
			// 3
			type: 'sticky',
			heightNum: 1.5, // 브라우저 높이의 5배로 scrollHeight 세팅
			scrollHeight: 0,
			objs: {
				container: document.querySelector('#scroll-section-3'),
				container_article: document.querySelector('#scroll-section-3 article'),
				dot_bg: document.querySelector('#scroll-section-3 .dot-bg'),
			},
			values: {
				container_article_scale:  [0, 100, { start: 0.1, end: 0.3 }],	
				dot_bg_scale: [0, 3, { start: 0.1, end: 0.3 }],		
			}
		}
		
	];

	function setLayout() {
		// 각 스크롤 섹션의 높이 세팅
		for (let i = 0; i < sceneInfo.length; i++) {
			if (sceneInfo[i].type === 'sticky') {
				sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
			} else if (sceneInfo[i].type === 'normal')  {
				sceneInfo[i].scrollHeight = sceneInfo[i].objs.content.offsetHeight; //+ window.innerHeight / 2;
			}
            sceneInfo[i].objs.container.style.height = `${sceneInfo[i].scrollHeight}px`;
		}

		yOffset = window.pageYOffset;

		let totalScrollHeight = 0;
		for (let i = 0; i < sceneInfo.length; i++) {
			totalScrollHeight += sceneInfo[i].scrollHeight;
			if (totalScrollHeight >= yOffset) {
				currentScene = i;
				break;
			}
		}
		document.body.setAttribute('id', `show-scene-${currentScene}`);

	}

	function calcValues(values, currentYOffset) {
		let rv;
		// 현재 씬(스크롤섹션)에서 스크롤된 범위를 비율로 구하기
		const scrollHeight = sceneInfo[currentScene].scrollHeight;
		const scrollRatio = currentYOffset / scrollHeight;

		if (values.length === 3) {
			// start ~ end 사이에 애니메이션 실행
			const partScrollStart = values[2].start * scrollHeight;
			const partScrollEnd = values[2].end * scrollHeight;
			const partScrollHeight = partScrollEnd - partScrollStart;

			if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
				rv = (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0];
			} else if (currentYOffset < partScrollStart) {
				rv = values[0];
			} else if (currentYOffset > partScrollEnd) {
				rv = values[1];
			}
		} else {
			rv = scrollRatio * (values[1] - values[0]) + values[0];
		}

		return rv;
	}

	function playAnimation() {
		const objs = sceneInfo[currentScene].objs;
		const values = sceneInfo[currentScene].values;
		const currentYOffset = yOffset - prevScrollHeight;
		const scrollHeight = sceneInfo[currentScene].scrollHeight;
		const scrollRatio = currentYOffset / scrollHeight;

		switch (currentScene) {
			case 0:
				break;
			case 1:
				objs.textA.style.transform = `translate3d(0, ${calcValues(values.textA_translateY_in, currentYOffset)}%, 0)`;
				objs.textA.style.opacity = calcValues(values.textA_opacity_in, currentYOffset);
				objs.textA.style.transform =  `scale(${calcValues(values.textA_scale_in, currentYOffset)}) translate3d(0, ${calcValues(values.textA_translateY_in, currentYOffset)}%, 0)`;
				objs.textB.style.opacity = calcValues(values.textB_opacity_in, currentYOffset);
				objs.textB.style.transform = `translate3d(0, ${calcValues(values.textB_translateY_in, currentYOffset)}%, 0)`;
				objs.projectA.style.opacity = calcValues(values.projectA_opacity_in, currentYOffset);
				break;

			case 2:
				objs.about_textA.style.opacity = calcValues(values.about_textA_opacity, currentYOffset);
				objs.about_textA.style.transform = `translate3d(0, ${calcValues(values.about_textA_translateY, currentYOffset)}%, 0)`;
				objs.about_photo.style.opacity = calcValues(values.about_photo_opacity, currentYOffset);
				objs.about_photo.style.transform = `translate3d(0, ${calcValues(values.about_photo_translateY, currentYOffset)}%, 0)`;
				
				objs.work_photo1.style.opacity = calcValues(values.work_photo_opacity, currentYOffset);
				objs.work_photo2.style.opacity = calcValues(values.work_photo2_opacity, currentYOffset);
				objs.work_photo3.style.opacity = calcValues(values.work_photo3_opacity, currentYOffset);
				objs.work_photo4.style.opacity = calcValues(values.work_photo4_opacity, currentYOffset);
				
				objs.work_photo1.style.transform =  `scale(0.7) translate3d(${calcValues(values.work_photo_translateX, currentYOffset)}%, 0,  0)`;
				objs.work_photo2.style.transform =  `scale(0.8) translate3d(${calcValues(values.work_photo2_translateX, currentYOffset)}%, 0,  0)`;
				objs.work_photo3.style.transform =  `scale(0.9) translate3d(${calcValues(values.work_photo3_translateX, currentYOffset)}%, 0,  0)`;
				objs.work_photo4.style.transform =  `scale(1) translate3d(${calcValues(values.work_photo4_translateX, currentYOffset)}%, 0,  0)`;
				
				objs.work_textA.style.opacity = calcValues(values.work_textA_opacity, currentYOffset);
				objs.work_textA.style.transform = `translate3d(0, ${calcValues(values.work_textA_translateY, currentYOffset)}%, 0)`;

			break;
			case 3:
				objs.dot_bg.style.transform =  `scale(${calcValues(values.dot_bg_scale, currentYOffset)})`;
				objs.container_article.style.clipPath =  `circle(${calcValues(values.container_article_scale, currentYOffset)}%)`;

			break;

		}
	}

	function scrollLoop() {
		enterNewScene = false;
		prevScrollHeight = 0;

		for (let i = 0; i < currentScene; i++) {
			prevScrollHeight += sceneInfo[i].scrollHeight;
		}

		if (delayedYOffset < prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
			document.body.classList.remove('scroll-effect-end');
		}

		if (delayedYOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
			enterNewScene = true;
			if (currentScene === sceneInfo.length - 1) {
				document.body.classList.add('scroll-effect-end');
			}
			if (currentScene < sceneInfo.length - 1) {
				currentScene++;
			}
			document.body.setAttribute('id', `show-scene-${currentScene}`);
		}

		if (delayedYOffset < prevScrollHeight) {
			enterNewScene = true;
			// 브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일)
			if (currentScene === 0) return;
			currentScene--;
			document.body.setAttribute('id', `show-scene-${currentScene}`);
		}

		if (enterNewScene) return;

		playAnimation();
	}

	function loop() {
		delayedYOffset = delayedYOffset + (yOffset - delayedYOffset) * acc;

		if (!enterNewScene) {
		
		}

        // 페이지 맨 아래로 갈 경우: 마지막 섹션은 스크롤 계산으로 위치 및 크기를 결정해야할 요소들이 많아서 1픽셀을 움직여주는 것으로 해결
        if ((document.body.offsetHeight - window.innerHeight) - delayedYOffset < 1) {
            let tempYOffset = yOffset;
            scrollTo(0, tempYOffset - 1);
        }

		rafId = requestAnimationFrame(loop);

		if (Math.abs(yOffset - delayedYOffset) < 1) {
			cancelAnimationFrame(rafId);
			rafState = false;
		}
    

		rafId = requestAnimationFrame(loop);

		if (Math.abs(yOffset - delayedYOffset) < 1) {
			cancelAnimationFrame(rafId);
			rafState = false;
		}
	}

	window.addEventListener('load', () => {
      
		setLayout();
		
		// 중간에서 새로고침 했을 경우 자동 스크롤로 제대로 그려주기
        let tempYOffset = yOffset;
        let tempScrollCount = 0;
        if (tempYOffset > 0) {
            let siId = setInterval(() => {
                scrollTo(0, tempYOffset);
                tempYOffset += 5;

                if (tempScrollCount > 20) {
                    clearInterval(siId);
                }
                tempScrollCount++;
            }, 20);
        }

        window.addEventListener('scroll', () => {
            yOffset = window.pageYOffset;
            scrollLoop();

  			if (!rafState) {
  				rafId = requestAnimationFrame(loop);
  				rafState = true;
  			}
  		});

  		window.addEventListener('resize', () => {
  			if (window.innerWidth > 900) {
  				setLayout();
			}
  		});

  		window.addEventListener('orientationchange', () => {
  			setTimeout(setLayout, 500);
		});
	});


})();



//여서부터는 메인 쿼리
(() => {

// 메인 헤더 메뉴버튼 토글 스크립트 
	const menuBt = document.querySelector('.svg-menu');
	const navi = document.querySelector('.navi-header');

	menuBt.addEventListener('click', () => {
  		menuBt.classList.toggle('on');
		navi.classList.toggle('on');
	});
	
// 스크롤 인디케이터
	window.addEventListener('DOMContentLoaded', function(){
		window.addEventListener("scroll", function(event){
			if(document.querySelector('.scroll-indicator p span') != null)setProgress();
		});
	});

	function setProgress() {          
		let currY = document.documentElement.scrollTop; //스크롤한 높이
		let totalY = document.documentElement.scrollHeight - document.documentElement.clientHeight; //전체 높이
		let percentage = (currY / totalY) * 100; //퍼센트 값
		document.querySelector('.scroll-indicator p span').innerText = Math.round(percentage); //프로그래스바 퍼센트
	}

	setInterval(function(){
		var nowTime = new Date();
		
		$(".time-header").text(nowTime.toLocaleTimeString());
	},1000); 
	


})();