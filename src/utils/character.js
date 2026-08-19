import dadMascot from '../assets/mascot.png';
import momMascot from '../assets/character/mom_mascot.png';
import daughterMascot from '../assets/character/daughter_mascot.svg';
import sonMascot from '../assets/character/son_mascot.svg';

// 홈 화면(HomeCharacterStage)과 같은 규칙으로 role(PARENT/CHILD)·gender(MALE/FEMALE)에
// 맞는 캐릭터 이미지를 고른다. 다른 화면에서도 같은 얼굴을 쓰려면 여기서 가져다 쓴다.
export const getMascotImage = (member) => {
  if (!member) return dadMascot;

  if (member.role === 'CHILD') {
    return member.gender === 'FEMALE' ? daughterMascot : sonMascot;
  }
  if (member.role === 'PARENT') {
    return member.gender === 'FEMALE' ? momMascot : dadMascot;
  }
  return dadMascot;
};
