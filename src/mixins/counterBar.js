export default {
  data() {

  },
  methods: {
    //传入dom元素与 配置即可
    initDanceBorder(el, options = {}) {
      //默认设置  尺寸单位均为px
      let _options = {
          //边框模糊度  
          blur: 1,
          //距依赖元素距离 
          margin: -5,
          //边框宽度  
          borderWidth: 4,
          //转一周时长  
          duration: 8000,
          //运动效果  default:匀速
          easing: 'linear',
          //是否两条运动线  默认两条
          double: true,
          //渐变色边框 优先级高  若使用渐变色或图片背景  请正确传入该值  否则边框不会显示
          'border-image': 'linear-gradient(to bottom right, #12c2e9,#c471ed,#f64f59) 10 10',
          //边框色   border-image 优先级低
          'border-color': 'green'
      }

      //存在正常色 不存在渐变色   渐变色赋值为空
      options['border-color'] && !options['border-image'] && (_options['border-image'] = 'none')
      //设置拷贝
      Object.keys(_options).forEach(key => {
          options[key] && (_options[key] = options[key]);
          //double 的特殊判断
          if (key == 'double' && typeof options[key] == 'boolean') {
              _options[key] = options[key]
          }
      })

      //元素基本属性
      const styleObj = {
          'content': '',
          'z-index': 10,
          'margin': `${_options.margin}px`,
          'border': `${_options.borderWidth}px solid`,
          'border-color': _options['border-color'],
          'border-image': _options['border-image'],
          'filter': `blur(${_options.blur}px)`,
          'position': 'absolute',
          'top': 0,
          'bottom': 0,
          'left': 0,
          'right': 0
      }

      const pW = el.style.width || el.offsetWidth;
      const pH = el.style.height || el.offsetHeight;

      const fullWidth = pW + _options.margin * -2;
      const fullHeight = pH + _options.margin * -2;

      //四边切割数组
      const rectArray = [
          `rect(${-_options.blur}px, ${fullWidth}px, ${-_options.margin}px, ${-_options.blur}px)`,
          `rect(0px, ${-_options.margin}px, ${fullHeight + _options.blur}px, ${-_options.blur}px)`,
          `rect(${pH}px, ${fullWidth + _options.blur}px, ${fullHeight + _options.blur}px, 0px)`,
          `rect(${-_options.blur}px, ${fullWidth + _options.blur}px, ${fullHeight}px, ${pW + _options.blur}px)`
      ]

      const clipAnimate = [{
              clip: rectArray[0]
          },
          {
              clip: rectArray[1],
              offset: 0.25
          },
          {
              clip: rectArray[2],
              offset: 0.5
          },
          {
              clip: rectArray[3],
              offset: 0.75
          },
          {
              clip: rectArray[0],
              offset: 1
          }
      ];

      //由于border的可见特性使delay无效  第二条延迟一半的边动画   从0.5开始  
      const clipAnimateTwo = [{
              clip: rectArray[2]
          },
          {
              clip: rectArray[3],
              offset: 0.25
          },
          {
              clip: rectArray[0],
              offset: 0.5
          },
          {
              clip: rectArray[1],
              offset: 0.75
          },
          {
              clip: rectArray[2],
              offset: 1
          }
      ];

      const animateOption = {
          duration: _options.duration,
          iterations: Infinity,
          easing: _options.easing
      };

      const section = this.initBaseEl(styleObj,el);

      //Web Animations  实现keyframes动画
      section.animate(clipAnimate, animateOption);

      //是否两条运动线
      if (_options.double) {
          let sectionTwo = this.initBaseEl(styleObj,el);
          sectionTwo.animate(clipAnimateTwo, animateOption);
      }
      //页面尺寸改变  修改
    },
    //构造元素
    initBaseEl(styleObj,el) {
      const section = document.createElement("section");
      //style属性赋值
      Object.keys(styleObj).forEach(key => {
          section.style[key] = styleObj[key]
      })

      el.appendChild(section);

      return section;
  }
  }
}