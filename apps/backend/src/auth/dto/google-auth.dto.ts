import { IsString, MinLength } from 'class-validator';

export class GoogleAuthDto {
  // The GIS "credential" is a signed JWT ID token, not an OAuth access
  // token — it's verified server-side against Google's public keys before
  // any of its claims are trusted.
  @IsString()
  @MinLength(1)
  idToken: string;
}
