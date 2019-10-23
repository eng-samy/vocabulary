<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Vocabulary extends CI_Controller {

	public function __construct()
	{	
		parent::__construct();
		$this->load->model('Vocabulary_Model');
	}

	public function index()
	{	
		echo json_encode($this->Vocabulary_Model->find_all());
	}

	public function add()
	{	
		$method = $_SERVER['REQUEST_METHOD'];
		if($method != 'POST'){
			echo json_encode(array('status' => 400,'message' => 'Bad Request'));
		}else{
			$this->load->helper('security');

			$data['native_word'] = $this->security->xss_clean($this->input->post(['englishValue']));
			$data['translated_word'] = $this->security->xss_clean($this->input->post(['germanValue']));
			$is_inserted = $this->Vocabulary_Model->add($data);
			if($is_inserted){
				echo json_encode(array('status' => 200,'message' => 'Added Successfully','item_id'=>$is_inserted, 'native_word' => $data['native_word'], "translated_word" => $data['translated_word']));
			}else{
				echo json_encode(array('status' => 500,'message' => 'Internal Server Error'));
			}
		}
	}

	public function delete()
	{	
		$method = $_SERVER['REQUEST_METHOD'];
		if($method != 'POST'){
			echo json_encode(array('status' => 400,'message' => 'Bad Request'));
		}else{

			$item_id = $_REQUEST['item_id'];
				$this->db->where('id',$item_id);
				$this->db->delete('vocabulary');
				echo json_encode(array('status' => 200,'message' => 'Deleted Successfully'));
		}
	}

	public function get_random_vocabs(){
		echo json_encode($this->Vocabulary_Model->random_rows());
	}

	public function submit_results(){
		$method = $_SERVER['REQUEST_METHOD'];
		if($method != 'POST'){
			echo json_encode(array('status' => 400,'message' => 'Bad Request'));
		}else{
			$results = array();
			$answers = json_decode($_POST['answers']);
			$hits =0;
			foreach($answers as $answer){
				$db_row = $this->Vocabulary_Model->find_one($answer->id);
				$db_row['answer'] = $answer->answer;
				$is_correct = $answer->answer === $db_row['translated_word']? 1 : 0 ;
				$hits += $is_correct;
				$db_row['result'] = $is_correct ;
				array_push($results,$db_row);
			}

			$hits_percenatge = round(($hits/count($answers))*100,2);
			$misses_percenatge = 100 - $hits_percenatge;

			echo json_encode(array('status' => 200,'results' => $results, 'hits' => $hits_percenatge, 'misses' => $misses_percenatge));			
			
		}
	}
}
