(function () { 'use strict';
  var C = document.querySelector('canvas');
  var c = C.getContext('2d'), W, H;

  (window.onresize = function () {
    W = C.width  = C.clientWidth;
    H = C.height = C.clientHeight;
  })();

  var wheel = 0,
      mouse = [0, 0],
      last  = [0, 0];

  function onMouseMove(e) {
    e.preventDefault();
    mouse[0] += e.clientX - last[0];
    mouse[1] += e.clientY - last[1];
    last = [e.clientX, e.clientY];
  }

  C.addEventListener('mousedown', function (e) {
    e.preventDefault();
    last = [e.clientX, e.clientY];
    C.addEventListener('mousemove', onMouseMove, false);
  }, false);

  C.addEventListener('mouseup', function (e) {
    e.preventDefault();
    C.removeEventListener('mousemove', onMouseMove, false);
  }, false);

  C.addEventListener('wheel', function (e) {
    e.preventDefault();
    wheel += e.deltaY < 0 ? 1 : -1;
  }, false);

  var points = [], p, i;
  var colors = [[
    vec4.get(1.0, 0.2, 0.2),
    vec4.get(1.0, 0.5, 0.2),
    vec4.get(1.0, 0.8, 0.2)
  ], [
    vec4.get(0.2, 0.2, 1.0),
    vec4.get(0.2, 0.5, 1.0),
    vec4.get(0.2, 0.8, 1.0)
  ]];

  for(i = 25000; i--; points.push([
    vec4.random(0.5),
    util.rand.item(colors[0])
  ]));

  for(i = 25000; i--; points.push([
    vec4.get(
      (1 - Math.pow(Math.random(), 5)) * (Math.random() < 0.5 ? 1 : -1),
      (1 - Math.pow(Math.random(), 5)) * (Math.random() < 0.5 ? 1 : -1),
      (1 - Math.pow(Math.random(), 5)) * (Math.random() < 0.5 ? 1 : -1)
    ),
    util.rand.item(colors[1])
  ]));

  for(i = 50000; i--; points.push([
    p = vec4.get(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ),
    util.rand.item(colors[vec4.length(p) > 0.5 ? 1 : 0])
  ]));

  function draw(d, v, c) {
    var x = (v[0] / v[3] + 1) / 2 * W | 0;
    var y = (v[1] / v[3] + 1) / 2 * H | 0;
    var z = (v[2] / v[3] + 1) / 2, i, a;

    if(x >= 0 && x < W
    && y >= 0 && y < H
    && z >= 0 && z < 1) {
      i = (x + y * W) * 4;
      a = c[3] / (v[3] + 1);
      d.data[  i] += 255 * a * c[0];
      d.data[++i] += 255 * a * c[1];
      d.data[++i] += 255 * a * c[2];
      d.data[++i] += 255 * a;
    }
  }

  var pos = 0, rot = [0, 0];

  util.loop(function (f, t, d) {
    var data = c.createImageData(C.width, C.height);

    pos    += (wheel / 10 - 1 - pos)     / 10;
    rot[0] += (mouse[0] /  200 - rot[0]) / 10;
    rot[1] += (mouse[1] / -200 - rot[1]) / 10;

    var matrix = mat4.join([
      mat4.rotate(rot[0], [0, 1, 0]),
      mat4.rotate(rot[1], [1, 0, 0]),
      mat4.translate([0, 0, pos]),
      mat4.perspective(75, W/H, 0.00001, 10)
    ]);

    for(var p, i = 0; p = points[i++];)
      draw(data, vec4.transform(p[0], matrix, vec4.buffer), p[1]);

    c.putImageData(data, 0, 0);

    c.fillStyle = '#FFF';
    c.font = '12px monospace';
    c.fillText(util.fps() + 0.5 | 0, 10, 20);
  });
}).call(this);