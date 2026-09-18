/** Shared touch input for mobile 3D walk — updated by overlay, read in useFrame. */
export type WalkthroughTouchInput = {
  /** -1 back … 1 forward (camera-relative) */
  forward: number;
  /** -1 left … 1 right */
  strafe: number;
  /** Radians to apply this frame */
  lookYaw: number;
  lookPitch: number;
};

export function createWalkthroughTouchInput(): WalkthroughTouchInput {
  return { forward: 0, strafe: 0, lookYaw: 0, lookPitch: 0 };
}
