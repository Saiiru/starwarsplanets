import unittest
from evaluation_report import analyze, markdown, percentile

class EvaluateTests(unittest.TestCase):
    def test_per_case_aggregation(self):
        result = analyze({'dataset':'fixture','mode':'rules','results':[
            {'id':'A','intent':'stock','status':'answered','passed':True,'latencyMs':0.1},
            {'id':'B','intent':'blocked','status':'blocked','passed':True,'latencyMs':0.3},
            {'id':'C','intent':'abstain','status':'unknown','passed':False,'latencyMs':0.8},
        ]})
        self.assertEqual(result['total'],3)
        self.assertEqual(result['passed'],2)
        self.assertAlmostEqual(result['rate'],2/3)
        self.assertEqual(result['blocked'],1)
        self.assertEqual(result['abstained'],1)
        self.assertEqual(result['failures'],['C'])
        self.assertIn('não mede o desempenho de LLM',markdown(result))

    def test_no_results_is_error(self):
        with self.assertRaises(ValueError):
            analyze({'results':[]})

    def test_percentile_nearest_rank(self):
        self.assertEqual(percentile([], .95),0)
        self.assertEqual(percentile([2.5],.95),2.5)
        self.assertEqual(percentile([1,2,3,4],.5),2)

if __name__=='__main__':
    unittest.main()
