p5.prototype.orbitControl = function(sensitivityX, sensitivityY) {
  this._assert3d('orbitControl');
  p5._validateParameters('orbitControl', arguments);

  // If the mouse is not in bounds of the canvas, disable all behaviors:
  const mouseInCanvas =
    this.mouseX < this.width &&
    this.mouseX > 0 &&
    this.mouseY < this.height &&
    this.mouseY > 0;
  if (!mouseInCanvas) return;

  const cam = this._renderer._curCamera;

  if (typeof sensitivityX === 'undefined') {
    sensitivityX = 1;
  }
  if (typeof sensitivityY === 'undefined') {
    sensitivityY = sensitivityX;
  }

  // disables normal right click behaviour and saves flag to prevent unnecesary running
  if (this.contextMenuDisabled !== true) {
    this.canvas.oncontextmenu = () => false;
    this._setProperty('contextMenuDisabled', true);
  }

  // disables scrolling behavior on canvas element and adds flag to prevent unnecessary running
  if (this.wheelDefaultDisabled !== true) {
    this.canvas.onwheel = () => false;
    this._setProperty('wheelDefaultDisabled', true);
  }

  const scaleFactor = this.height < this.width ? this.height : this.width;

  // ZOOM if there is a change in mouseWheelDelta
  if (this._mouseWheelDeltaY !== this._pmouseWheelDeltaY) {
    // zoom according to direction of mouseWheelDeltaY rather than value
    if (this._mouseWheelDeltaY > 0) {
      this._renderer._curCamera._orbit(0, 0, sensitivityZoom * scaleFactor);
    } else {
      this._renderer._curCamera._orbit(0, 0, -sensitivityZoom * scaleFactor);
    }
  }

  if (this.mouseIsPressed) {
    // ORBIT BEHAVIOR
    if (this.mouseButton === this.LEFT) {
      const deltaTheta =
        -sensitivityX * (this.mouseX - this.pmouseX) / scaleFactor;
      const deltaPhi =
        sensitivityY * (this.mouseY - this.pmouseY) / scaleFactor;
      this._renderer._curCamera._orbit(deltaTheta, deltaPhi, 0);
    } else if (this.mouseButton === this.RIGHT) {
      // PANNING BEHAVIOR along X/Z camera axes and restricted to X/Z plane
      // in world space
      const local = cam._getLocalAxes();

      // normalize portions along X/Z axes
      const xmag = Math.sqrt(local.x[0] * local.x[0] + local.x[2] * local.x[2]);
      if (xmag !== 0) {
        local.x[0] /= xmag;
        local.x[2] /= xmag;
      }

      // normalize portions along X/Z axes
      const ymag = Math.sqrt(local.y[0] * local.y[0] + local.y[2] * local.y[2]);
      if (ymag !== 0) {
        local.y[0] /= ymag;
        local.y[2] /= ymag;
      }

      // move along those vectors by amount controlled by mouseX, pmouseY
      const dx = -1 * sensitivityX * (this.mouseX - this.pmouseX);
      const dz = -1 * sensitivityY * (this.mouseY - this.pmouseY);

      // restrict movement to XZ plane in world space
      cam.setPosition(
        cam.eyeX + dx * local.x[0] + dz * local.z[0],
        cam.eyeY,
        cam.eyeZ + dx * local.x[2] + dz * local.z[2]
      );
    }
  }
  return this;
};
