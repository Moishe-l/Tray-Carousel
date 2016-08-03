var Tray = function(props) {
  var createElement = function(props) {
    var element = document.createElement(props.elementType);
    element.className = props.className;
    return element;
  };

  var trayCont = createElement({
    elementType: 'div',
    className: props.trayContClass || 'trayCont'
  });

  var viewCont = createElement({
    elementType: 'div',
    className: props.viewContClass || 'viewCont'
  });
  trayCont.appendChild(viewCont);

  var items = props.items.map(props.itemTemplate);
  var itemsPerPage = props.itemsPerPage;
  var viewWidth;
  var maxLeft;
  var dotAmount;
  var selectedDotClass = 'selectedDot';
  var selectedDotClassReg = new RegExp('(?:^|[ ])' + selectedDotClass + '(?![^ ])', 'g');

  var slider = createElement({
    elementType: 'div',
    className: props.sliderClass || 'slider'
  });
  viewCont.appendChild(slider);

  items.forEach(function(item) {
    slider.appendChild(item);
  });

  var btnCont = createElement({
    elementType: 'div',
    className: props.btnContClass || 'btnCont'
  });
  viewCont.appendChild(btnCont);

  var prevBtn = createElement({
    elementType: 'div',
    className: props.prevBtnClass || 'prevBtn'
  });
  prevBtn.textContent = '<';
  prevBtn.onclick = function() {
    var left = parseInt(slider.style.left);
    var newLeft = left >= 0 ? maxLeft : left + viewWidth;
    newLeft = boundLeftIncrement(left, newLeft);
    newLeft = checkDot(newLeft);
    animateLeft(newLeft);
  };
  btnCont.appendChild(prevBtn);

  var nextBtn = createElement({
    elementType: 'div',
    className: props.nextBtnClass || 'nextBtn'
  });
  nextBtn.textContent = '>';
  nextBtn.onclick = function() {
    var left = parseInt(slider.style.left);
    var newLeft = left <= maxLeft ? '0' : left - viewWidth;
    newLeft = boundRightIncrement(left, newLeft);
    newLeft = checkDot(newLeft);
    animateLeft(newLeft);
  };
  btnCont.appendChild(nextBtn);

  var dotCont = createElement({
    elementType: 'ul',
    className: props.dotContClass || 'dotCont'
  });
  trayCont.appendChild(dotCont);

  var dots = [];

  props.trayParent.appendChild(trayCont);

  var firstItem = items[0];
  var firstItemStyle = firstItem.currentStyle || window.getComputedStyle(firstItem);
  var itemWidth = parseInt(firstItemStyle.getPropertyValue('margin-left')) + firstItem.offsetWidth + parseInt(firstItemStyle.getPropertyValue('margin-right'));
  var fullWidth = items.length * itemWidth;
  slider.style.width = fullWidth + 'px';

  var setItemsPerPage = function(newItemsPerPage) {
    itemsPerPage = newItemsPerPage;
    viewWidth = itemWidth * itemsPerPage;
    maxLeft = -fullWidth + (itemWidth * itemsPerPage);
    trayCont.style.width = viewWidth + 'px';
    createDots();
    updateLeft();
  };

  var boundRightIncrement = function(left, newLeft) {
    return left > maxLeft && left - viewWidth < maxLeft ? maxLeft : newLeft;
  };

  var boundLeftIncrement = function(left, newLeft) {
    return left < 0 && left + viewWidth > 0 ? 0 : newLeft
  };

  var boundRightSet = function(left, newLeft) {
    return left >= maxLeft && newLeft <= maxLeft ? maxLeft : newLeft;
  };

  var updateLeft = function() {
    var left = parseInt(slider.style.left);
    var newLeft = left < maxLeft ? maxLeft : (left > 0 ? 0 : left);
    if (typeof newLeft === 'number') {
      newLeft = checkDot(newLeft);
      animateLeft(newLeft);
    }
  };

  var removeSelectedDotClass = function() {
    dots.forEach(function(dot) {
      dot.className = dot.className.replace(selectedDotClassReg, '');
    });
  };

  var checkDot = function(newLeft) {
    removeSelectedDotClass();
    var nearLeft;
    var nearDistance;
    var nearDot;
    for (var i = 0; i < dotAmount; i++) {
      var dotLeft = getDotLeft(dots[i].getAttribute('pos-val'));
      if (newLeft != dotLeft) {
        var distance = Math.abs(newLeft - dotLeft);
        if (typeof nearDistance !== 'number' || distance < nearDistance) {
          nearLeft = dotLeft;
          nearDistance = distance;
          nearDot = i;
        }
        continue;
      }
      dots[i].className += ' ' + selectedDotClass;
      return newLeft;
    }
    dots[nearDot].className += ' ' + selectedDotClass;
    return nearLeft;
  };
  var animateLeft = function(newLeft) {
    slider.style.left = newLeft + 'px';
  };

  var createDots = function() {
    dots = [];
    dotAmount = items.length / itemsPerPage;
    var dotContFragment = document.createDocumentFragment();
    for (var i = 0; i < dotAmount; i++) {
      var positionVal = (itemsPerPage * i);
      var dot = createElement({
        elementType: 'li',
        className: (props.dotClass || 'dot') + (getDotLeft(positionVal) == parseInt(slider.style.left) ? ' ' + selectedDotClass : '')
      });
      dot.setAttribute('pos-val', positionVal);
      dot.onclick = function() {
        var dot = this;
        removeSelectedDotClass();
        dot.className += ' ' + selectedDotClass;
        animateLeft(getDotLeft(dot.getAttribute('pos-val')));
      };
      dotContFragment.appendChild(dot);
      dots[i] = dot;
    }
    while (dotCont.firstChild) {
      dotCont.removeChild(dotCont.firstChild);
    }
    dotCont.appendChild(dotContFragment);
  };

  var getDotLeft = function(positionVal) {
    var newLeft = -(positionVal * itemWidth);
    return boundRightSet(parseInt(slider.style.left), newLeft);
  };

  var setItemsPerPageFromScreenWidth = function(tray) {
    for (var i = 0; i < props.itemsPerPage.length; i++) {
      var screenRange = props.itemsPerPage[i];
      if ((typeof screenRange.min === 'number' && Math.min(screen.width, screenRange.min) != screenRange.min) || (typeof screenRange.max === 'number' && Math.max(screen.width, screenRange.max) != screenRange.max)) {
        continue;
      }
      return setItemsPerPage(screenRange.items);
    }
  };
  if (props.itemsPerPage instanceof Array) {
    setItemsPerPageFromScreenWidth(props.itemsPerPage);
  } else {
    setItemsPerPage(typeof props.itemsPerPage === 'number' ? props.itemsPerPage : items.length);
  }
};
var items = [{
  'title': 'one'
}, {
  'title': 'two'
}, {
  'title': 'three'
}, {
  'title': 'four'
}, {
  'title': 'five'
}, {
  'title': 'six'
}];
var itemTemplate = function(item) {
  var itemElement = document.createElement('section');
  var title = document.createElement('h3');
  title.textContent = item.title;
  itemElement.appendChild(title);
  itemElement.className = 'slide';
  return itemElement;
};
var tray = new Tray({
  trayParent: document.getElementById('tray'),
  items: items,
  itemTemplate: itemTemplate,
  itemsPerPage: [{
    min: 1024,
    items: 3
  }, {
    min: 768,
    max: 1024,
    items: 2
  }, {
    max: 768,
    items: 1
  }]
});
var tray = new Tray({
  trayParent: document.getElementById('tray'),
  items: items,
  itemTemplate: itemTemplate,
  itemsPerPage: 1
});
