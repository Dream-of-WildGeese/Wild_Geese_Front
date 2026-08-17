import { getMyFamily } from '../api/family';
import { getUserId } from '../api/client';
import { useApi } from './useApi';
import { findPartner, getRelationLabel } from '../utils/family';

// '나'와 짝지어진 가족 구성원, 그리고 role/gender로 정해지는 호칭(엄마/아빠/딸/아들)을 돌려준다.
export const useFamilyRelation = () => {
  const { data: family, loading } = useApi(getMyFamily);
  const partner = findPartner(family, getUserId());

  return {
    partner,
    partnerLabel: partner ? getRelationLabel(partner) : '가족',
    loading,
  };
};
