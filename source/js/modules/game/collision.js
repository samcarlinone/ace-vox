import {vec3} from 'gl-matrix';

class Collision {
  /**
   * boxCylinder - Collide box and cylinder to get restitution vector, (may be unreliable if center of cylinder is inside box)
   *
   * @param  {vec3} c1  lower corner of box !!!must be less than c2!!!
   * @param  {vec3} c2  upper corner of box
   * @param  {vec3} s1  cylinder center
   * @param  {vec3} r   cylinder radius
   * @param  {vec3} h   cylinder height
   * @param  {vec3} out restitution vector
   * @return {boolean}     whether collision occured
   */
  boxCylinder(c1, c2, s1, r, h, out) {
    if(c1[1] <= s1[1] + h/2 && c2[1] >= s1[1] - h/2) {
      //Vertically intersecting
      vec3.set(out, this.clamp(s1[0], c1[0], c2[0]), this.clamp(s1[1], c1[1], c2[1]), this.clamp(s1[2], c1[2], c2[2]));
      vec3.sub(out, s1, out);
      vec3.set(out, out[0], 0, out[2]);
      var mag = vec3.len(out);

      if(mag < r) {
        //Horizontally intersecting
        if(c1[0] < s1[0] && s1[0] < c2[0] && c1[2] < s1[2] && s1[2] < c2[2]) {
          //Sphere center is inside box
          vec3.sub(out, c2, c1);
          vec3.add(out, out, c1);
          vec3.sub(out, s1, out);
          vec3.scale(out, out, 1000000);

          vec3.set(out, this.clamp(out[0], c1[0]-0.1, c2[0]+0.1), this.clamp(out[1], c1[1]-0.1, c2[1]+0.1), this.clamp(out[2], c1[2]-0.1, c2[2]+0.1));
          vec3.sub(out, s1, out);
          mag = vec3.len(out);
          vec3.scale(out, out, r/mag-1);

          return true;
        } else {
          //Sphere center is outside box
          vec3.scale(out, out, r/mag-1);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * boxSphere - Collide box and sphere to get restitution vector, (may be unreliable if center of sphere is inside box)
   *
   * @param  {vec3} c1  lower corner of box !!!must be less than c2!!!
   * @param  {vec3} c2  upper corner of box
   * @param  {vec3} s1  sphere center
   * @param  {vec3} r   sphere radius
   * @param  {vec3} out restitution vector
   * @return {boolean}     whether collision occured
   */
  boxSphere(c1, c2, s1, r, out) {
    vec3.set(out, this.clamp(s1[0], c1[0], c2[0]), this.clamp(s1[1], c1[1], c2[1]), this.clamp(s1[2], c1[2], c2[2]));
    vec3.sub(out, s1, out);
    var mag = vec3.len(out);

    if(mag < r) {
      //Intersecting
      if(c1[0] < s1[0] && s1[0] < c2[0] && c1[1] < s1[1] && s1[1] < c2[1] && c1[2] < s1[2] && s1[2] < c2[2]) {
        //Sphere center is inside box
        vec3.sub(out, c2, c1);
        vec3.add(out, out, c1);
        vec3.sub(out, s1, out);
        vec3.scale(out, out, 1000000);

        vec3.set(out, this.clamp(out[0], c1[0]-0.1, c2[0]+0.1), this.clamp(out[1], c1[1]-0.1, c2[1]+0.1), this.clamp(out[2], c1[2]-0.1, c2[2]+0.1));
        vec3.sub(out, s1, out);
        mag = vec3.len(out);
        vec3.scale(out, out, r/mag-1);

        return true;
      } else {
        //Sphere center is outside box
        vec3.scale(out, out, r/mag-1);
        return true;
      }
    }

    return false;
  }

  clamp(val, min, max) {
    return Math.max(Math.min(val, max), min);
  }
}

export default (new Collision);
