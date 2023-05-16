import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Update } from '../libs/update';
import vt from '../glsl/mesh.vert';
import fg from '../glsl/mesh.frag';
import { Object3D, PlaneGeometry, ShaderMaterial, Color, Mesh, Vector2 } from 'three';
import { MousePointer } from '../core/mousePointer';
import { Util } from '../libs/util';

export class Visual extends Canvas {

  private _con:Object3D;
  private _mesh: Array<Mesh> = [];

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    const seg = 4;
    const geo = new PlaneGeometry(1, 1, seg, seg)

    const num = 100;
    for(let i = 0; i < num; i ++) {
      const col = Util.map(i, 0, 1, 0, num);

      const m = new Mesh(
        geo,
        new ShaderMaterial({
          vertexShader:vt,
          fragmentShader:fg,
          transparent: true,
          depthTest: false,
          wireframe: true,
          uniforms:{
            color:{value: new Color(0xffffff)},
            mouse:{value: new Vector2(0,0)},
            alpha:{value: col},
          }
        })
      );
      this._con.add(m);
      this._mesh.push(m);
    }
    this._mesh.reverse();



    this._resize();
  }


  protected _update(): void {
    super._update();

    const sw = this.renderSize.width;
    const sh = this.renderSize.height;

    const mx = MousePointer.instance.easeNormal.x;
    const my = MousePointer.instance.easeNormal.y;

    this._mesh.forEach((m, i) => {
      const s = Util.map(i, 1, 1, 0, this._mesh.length);
      m.scale.set(sw * s, sh * s, 1);

      const uni = this._getUni(m);
      uni.mouse.value.x = Util.map(mx, 0, 1, -1, 1);
      uni.mouse.value.y = Util.map(my, 1, 0, -1, 1);

      const kake = Util.map(i, sw * 0.1, 0, 0, this._mesh.length);
      m.position.x = mx * kake + Math.sin(Util.radian(this._c * 2 + i * 1)) * 0;
      m.position.y = my * -1 * kake + Math.cos(Util.radian(this._c * 2 + i * 1)) * kake;

      m.rotation.z = Util.radian(this._c * 1 + i * 1);
    });

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.render(this.mainScene, this.cameraPers);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);

    this.cameraPers.fov = 90;
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();
  }
}
