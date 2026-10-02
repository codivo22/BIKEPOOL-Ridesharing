export default function Avatar({ user, size = 'md' }) {
  const initials = user?.initials || user?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') || '?';
  return user?.profilePhoto
    ? <img className={`avatar avatar-${size}`} src={user.profilePhoto} alt={user.name} />
    : <span className={`avatar avatar-${size}`}>{initials.toUpperCase()}</span>;
}
