"""Negative tests for the relationship validator (SPEC.md §13.4, R1–R14).

Standard library only:  python -m unittest discover -s tests -v

Each test corrupts one aspect of a copy of the committed data and asserts
that the validator reports the expected invariant. The committed data must
pass unchanged.
"""
import copy
import json
import os
import sys
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import validate_relationships as vr  # noqa: E402

ATLAS = json.load(open(os.path.join(ROOT, 'data', 'atlas.json'), encoding='utf-8'))
REL = json.load(open(os.path.join(ROOT, 'data', 'relationships.json'), encoding='utf-8'))


def rel_by_id(rel, rid):
    return next(e for e in rel['relationships'] if e['id'] == rid)


class RelationshipValidatorTest(unittest.TestCase):
    def setUp(self):
        self.atlas = copy.deepcopy(ATLAS)
        self.rel = copy.deepcopy(REL)
        self.root = tempfile.mkdtemp()  # an empty tree: no prototype/ directory

    def assertFlags(self, code):
        errs = vr.validate(self.atlas, self.rel, self.root)
        self.assertTrue(any(e.startswith(code + ':') for e in errs), f'expected {code}, got {errs}')

    def test_committed_data_passes(self):
        self.assertEqual(vr.validate(self.atlas, self.rel, self.root), [])

    def test_unknown_endpoint(self):
        rel_by_id(self.rel, 'rel-net-network')['target'] = 'm-does-not-exist'
        self.assertFlags('R2')

    def test_deferred_item_is_not_a_node(self):
        rel_by_id(self.rel, 'rel-lens-hosts-pnoa')['target'] = 'x-snto-alpine'
        self.assertFlags('R2')

    def test_wrong_kind_for_predicate(self):
        rel_by_id(self.rel, 'rel-net-network')['target'] = 't-madrid'
        self.assertFlags('R2')

    def test_hypothetical_relation_rejected(self):
        e = copy.deepcopy(rel_by_id(self.rel, 'rel-lens-hosts-pnoa'))
        e.update(id='rel-hyp', predicate='potential_application', **{'class': 'hypothetical'})
        self.rel['relationships'].append(e)
        self.assertFlags('R2')
        self.rel['predicates'].append({'id': 'potential_application', 'label': 'x', 'class': 'hypothetical', 'domain': ['research'],
                                       'range': ['research'], 'direction': 'a', 'definition': 'b', 'required_evidence': 'c', 'limits': 'd'})
        self.assertFlags('R3')

    def test_conceptual_class_rejected(self):
        self.rel['classes'].append({'id': 'conceptual', 'label': 'Conceptual', 'definition': 'analyst-defined'})
        self.assertFlags('R3')

    def test_class_mismatch(self):
        rel_by_id(self.rel, 'rel-net-network')['class'] = 'technical'
        self.assertFlags('R3')

    def test_missing_evidence(self):
        rel_by_id(self.rel, 'rel-hatix-extends-hatip')['evidence'] = []
        self.assertFlags('R4')

    def test_restricted_source(self):
        self.rel['sources'][0]['access'] = 'restricted'
        self.assertFlags('R4')

    def test_branch_head_source(self):
        s = self.rel['sources'][0]
        s['url'] = s['url'].replace(s['pinned_ref'], 'main')
        self.assertFlags('R4')

    def test_technical_from_wrong_repository(self):
        e = rel_by_id(self.rel, 'rel-mcp-depends-lens')
        e['evidence'] = [{'source_id': 'rs-lens-readme-313', 'lines': [1, 2], 'summary': 'x'}]
        self.assertFlags('R5')

    def test_dataset_without_extract(self):
        rel_by_id(self.rel, 'rel-net-osm')['extract'] = ''
        self.assertFlags('R6')

    def test_silent_version_substitution(self):
        e = rel_by_id(self.rel, 'rel-mcp-depends-lens')
        next(v for v in e['versions'] if v['node'] == 'p-lens')['note'] = None
        self.assertFlags('R7')

    def test_missing_version_of_one_end(self):
        e = rel_by_id(self.rel, 'rel-lens-reads-hati-pilot')
        e['versions'] = [v for v in e['versions'] if v['node'] != 'r-hati-pilot']
        self.assertFlags('R7')

    def test_derived_relation_missing(self):
        self.rel['relationships'] = [e for e in self.rel['relationships'] if e['id'] != 'rel-net-terr']
        self.assertFlags('R8')

    def test_derived_relation_without_atlas_field(self):
        rel_by_id(self.rel, 'rel-net-terr')['target'] = 't-madrid'
        self.assertFlags('R8')

    def test_situated_in_must_be_derived(self):
        del rel_by_id(self.rel, 'rel-net-terr')['derived_from']
        self.assertFlags('R8')

    def test_duplicate_relationship(self):
        e = copy.deepcopy(rel_by_id(self.rel, 'rel-net-network'))
        e['id'] = 'rel-net-network-dup'
        self.rel['relationships'].append(e)
        self.assertFlags('R9')

    def test_non_relationship_without_interpretation(self):
        self.rel['non_relationships'][0]['interpretation'] = ''
        self.assertFlags('R10')

    def test_non_relationship_contradicting_dependency(self):
        self.rel['non_relationships'][0]['subject'] = 'p-lens'
        self.rel['non_relationships'][0]['objects'] = ['r-hati-pilot']
        self.assertFlags('R10')

    def test_score_field(self):
        rel_by_id(self.rel, 'rel-net-network')['confidence'] = 0.8
        self.assertFlags('R11')

    def test_importance_field(self):
        self.rel['methods'][0]['importance'] = 3
        self.assertFlags('R11')

    def test_human_verification_without_record(self):
        rel_by_id(self.rel, 'rel-net-network')['verification'] = {'state': 'human_verified'}
        self.assertFlags('R12')

    def test_file_level_claims_human_verification(self):
        self.rel['verification']['human_verification'] = 'complete'
        self.assertFlags('R12')

    def test_notice_must_state_limits(self):
        self.rel['notice'] = 'Relations between items.'
        self.assertFlags('R13')

    def test_prototype_directory_forbidden(self):
        os.mkdir(os.path.join(self.root, 'prototype'))
        self.assertFlags('R14')

    def test_id_collision_with_atlas(self):
        self.rel['methods'][0]['id'] = 'r-hati-pilot'
        self.assertFlags('R1')


if __name__ == '__main__':
    unittest.main()
